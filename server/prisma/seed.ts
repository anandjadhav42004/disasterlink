import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient, Role, Severity, SOSStatus, SOSType } from "@prisma/client";

const prisma = new PrismaClient();

const places = [
  { name: "Delhi", latitude: 28.6139, longitude: 77.209 },
  { name: "Mumbai", latitude: 19.076, longitude: 72.8777 },
  { name: "Tokyo", latitude: 35.6762, longitude: 139.6503 }
];

async function main() {
  const password = await bcrypt.hash("DisasterLink@123", 12);

  await prisma.refreshToken.deleteMany();
  await prisma.sOSRequest.deleteMany();
  await prisma.volunteer.deleteMany();
  await prisma.alert.deleteMany();
  await prisma.shelter.deleteMany();
  await prisma.user.deleteMany();

  const admins = await Promise.all(
    [1, 2, 3].map((i) =>
      prisma.user.create({
        data: { name: `Admin ${i}`, phone: `+91990000000${i}`, email: `admin${i}@disasterlink.app`, password, role: Role.ADMIN }
      })
    )
  );

  const volunteers = await Promise.all(
    Array.from({ length: 10 }, (_, i) => {
      const place = places[i % places.length];
      return prisma.user.create({
        data: {
          name: `Volunteer ${i + 1}`,
          phone: `+9198000000${String(i + 1).padStart(2, "0")}`,
          email: `volunteer${i + 1}@disasterlink.app`,
          password,
          role: Role.VOLUNTEER,
          latitude: place.latitude + i * 0.01,
          longitude: place.longitude + i * 0.01,
          volunteerProfile: { create: { isAvailable: i % 4 !== 0 } }
        },
        include: { volunteerProfile: true }
      });
    })
  );

  const survivors = await Promise.all(
    Array.from({ length: 5 }, (_, i) => {
      const place = places[i % places.length];
      return prisma.user.create({
        data: {
          name: `Survivor ${i + 1}`,
          phone: `+9177000000${String(i + 1).padStart(2, "0")}`,
          email: `survivor${i + 1}@disasterlink.app`,
          password,
          role: Role.SURVIVOR,
          latitude: place.latitude - i * 0.01,
          longitude: place.longitude - i * 0.01
        }
      });
    })
  );

  await prisma.shelter.createMany({
    data: [
      ["Delhi Relief Camp A", 28.626, 77.21, "Connaught Place, Delhi"],
      ["Delhi Medical Shelter", 28.57, 77.23, "AIIMS corridor, Delhi"],
      ["Mumbai Coastal Shelter", 19.08, 72.84, "Bandra, Mumbai"],
      ["Mumbai Transit Camp", 19.04, 72.86, "Dadar, Mumbai"],
      ["Tokyo East Shelter", 35.69, 139.72, "Shinjuku, Tokyo"],
      ["Tokyo Bay Response Center", 35.63, 139.78, "Odaiba, Tokyo"],
      ["Delhi North School Camp", 28.7, 77.18, "North Delhi"],
      ["Mumbai Central Hall", 18.97, 72.82, "South Mumbai"]
    ].map(([name, latitude, longitude, address], i) => ({
      name: String(name),
      latitude: Number(latitude),
      longitude: Number(longitude),
      capacity: 120 + i * 30,
      occupied: 20 + i * 9,
      address: String(address),
      contact: `+9111400000${i}`
    }))
  });

  const types = Object.values(SOSType);
  const statuses = Object.values(SOSStatus);
  const severities = Object.values(Severity);
  for (let i = 0; i < 20; i += 1) {
    const survivor = survivors[i % survivors.length];
    const place = places[i % places.length];
    const volunteer = volunteers[i % volunteers.length].volunteerProfile;
    await prisma.sOSRequest.create({
      data: {
        userId: survivor.id,
        type: types[i % types.length],
        description: `Demo incident ${i + 1}: needs coordinated response and live tracking.`,
        latitude: place.latitude + (i % 5) * 0.008,
        longitude: place.longitude - (i % 5) * 0.008,
        severity: severities[i % severities.length],
        status: statuses[i % statuses.length],
        volunteerId: i % 3 === 0 ? volunteer?.id : undefined
      }
    });
  }

  await prisma.alert.createMany({
    data: [
      { title: "Aftershock risk", message: "Avoid damaged structures and move to marked shelters.", severity: Severity.HIGH, latitude: 35.6762, longitude: 139.6503, radius: 25 },
      { title: "Flood warning", message: "Low-lying roads near the coast are closed.", severity: Severity.CRITICAL, latitude: 19.076, longitude: 72.8777, radius: 18 },
      { title: "Medical triage active", message: "Nearest medical teams are prioritizing critical SOS calls.", severity: Severity.MEDIUM },
      { title: "Shelter capacity update", message: "Delhi Relief Camp A has space for incoming families.", severity: Severity.LOW, latitude: 28.6139, longitude: 77.209, radius: 12 },
      { title: "Fire containment zone", message: "Volunteers should approach from the northern checkpoint.", severity: Severity.HIGH }
    ]
  });

  console.log(`Seeded DisasterLink demo data. Login with ${admins[0].email} / DisasterLink@123`);
}

main().finally(async () => prisma.$disconnect());
