require("dotenv").config();
const { getCollection } = require("./database/mongo");

async function seed() {
  try {
    const courses = await getCollection("courses");

    // очистка коллекции перед сидом (нормально для dev)
    await courses.deleteMany({});

    const data = [
      {
        type: "course",
        title: "Calculus 1",
        code: "MATH101",
        credits: 5,
        description:
          "Foundations of calculus including limits, derivatives, and integrals",
        instructor: "Birlik Koshan",
        email: "birlik@university.edu",
        schedule: "Mon & Wed 10:00-11:30 AM",
        room: "101 Math Building",
        capacity: 30,
        enrolled: 28,
        prerequisites: "None",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        type: "course",
        title: "Introduction to Programming",
        code: "CS102",
        credits: 5,
        description:
          "Learn programming fundamentals using Python, problem-solving, and algorithms",
        instructor: "Artur Jaxygaliyev",
        email: "artur@university.edu",
        schedule: "Tue & Thu 14:00-15:30 PM",
        room: "205 Tech Building",
        capacity: 30,
        enrolled: 24,
        prerequisites: "None",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        type: "course",
        title: "International Language 1",
        code: "LANG301",
        credits: 5,
        description:
          "English language proficiency development with focus on communication and writing",
        instructor: "Alikhan Nurzhan",
        email: "alikhan@university.edu",
        schedule: "Mon & Fri 13:00-14:30 PM",
        room: "310 Language Center",
        capacity: 30,
        enrolled: 19,
        prerequisites: "None",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        type: "course",
        title: "Object-Oriented Programming",
        code: "CS203",
        credits: 5,
        description:
          "Master OOP principles including classes, inheritance, polymorphism, and design patterns",
        instructor: "Nursultan Beisenbek",
        email: "nursultan@university.edu",
        schedule: "Wed & Fri 15:00-16:30 PM",
        room: "215 Tech Building",
        capacity: 30,
        enrolled: 15,
        prerequisites: "Introduction to Programming",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        type: "course",
        title: "Web Technologies",
        code: "WEB304",
        credits: 5,
        description:
          "Comprehensive web development covering frontend, backend, and modern web frameworks",
        instructor: "Birlik Koshan",
        email: "birlik@university.edu",
        schedule: "Tue & Thu 11:00-12:30 PM",
        room: "105 Tech Building",
        capacity: 30,
        enrolled: 22,
        prerequisites: "Introduction to Programming",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    const result = await courses.insertMany(data);
    console.log(`✅ Seed completed. Inserted ${result.insertedCount} courses.`);
    process.exit(0);
  } catch (err) {
    console.error("❌ Seed failed:", err.message);
    process.exit(1);
  }
}

seed();
