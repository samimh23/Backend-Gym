import { PrismaClient, UserRole, SubscriptionPlan, SubscriptionStatus, PaymentMethod, Difficulty, ActivityLevel, Gender } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Hash password for demo users
  const hashedPassword = await bcrypt.hash('password123', 12);

  // Create Store Owner
  const storeOwner = await prisma.user.create({
    data: {
      email: 'owner@fitness.com',
      password: hashedPassword,
      firstName: 'Store',
      lastName: 'Owner',
      role: UserRole.STORE_OWNER,
      isEmailVerified: true,
      storeOwnerProfile: {
        create: {
          storeName: 'Fitness Hub Central',
          storeAddress: '123 Fitness Street, Gym City, GC 12345',
          businessLicense: 'BL-2025-001',
          commission: 15.0,
        },
      },
    },
  });

  // Create Sample Coaches
  const coach1 = await prisma.user.create({
    data: {
      email: 'john.coach@fitness.com',
      password: hashedPassword,
      firstName: 'John',
      lastName: 'Smith',
      phone: '+1234567890',
      role: UserRole.COACH,
      isEmailVerified: true,
      coachProfile: {
        create: {
          specialization: 'Weight Training & Muscle Building',
          bio: 'Certified personal trainer with 8 years of experience helping clients build muscle and lose fat.',
          experience: 8,
          certifications: ['NASM-CPT', 'CSCS', 'Nutrition Specialist'],
          monthlyRate: 150.00,
          yearlyRate: 1500.00,
          isVerified: true,
          rating: 4.8,
          totalReviews: 45,
          availableSlots: 25,
          socialLinks: {
            instagram: '@johnsmith_fit',
            youtube: 'JohnSmithFitness',
          },
        },
      },
    },
  });

  const coach2 = await prisma.user.create({
    data: {
      email: 'sarah.yoga@fitness.com',
      password: hashedPassword,
      firstName: 'Sarah',
      lastName: 'Johnson',
      phone: '+1234567891',
      role: UserRole.COACH,
      isEmailVerified: true,
      coachProfile: {
        create: {
          specialization: 'Yoga & Flexibility Training',
          bio: 'Yoga instructor specializing in flexibility, mindfulness, and stress relief through movement.',
          experience: 5,
          certifications: ['RYT-500', 'Yin Yoga Certified', 'Meditation Teacher'],
          monthlyRate: 120.00,
          yearlyRate: 1200.00,
          isVerified: true,
          rating: 4.9,
          totalReviews: 67,
          availableSlots: 30,
          socialLinks: {
            instagram: '@sarahyoga',
            website: 'sarahjohnsonyoga.com',
          },
        },
      },
    },
  });

  // Create Sample Clients
  const client1 = await prisma.user.create({
    data: {
      email: 'alice.client@fitness.com',
      password: hashedPassword,
      firstName: 'Alice',
      lastName: 'Brown',
      phone: '+1234567892',
      role: UserRole.CLIENT,
      isEmailVerified: true,
      clientProfile: {
        create: {
          dateOfBirth: new Date('1990-05-15'),
          gender: Gender.FEMALE,
          weight: 65.5,
          height: 168.0,
          fitnessGoal: 'Lose weight and build lean muscle',
          activityLevel: ActivityLevel.LIGHTLY_ACTIVE,
          medicalConditions: [],
          preferences: {
            dietType: 'Vegetarian',
            workoutTime: 'Morning',
            equipment: 'Minimal',
          },
        },
      },
    },
  });

  const client2 = await prisma.user.create({
    data: {
      email: 'bob.client@fitness.com',
      password: hashedPassword,
      firstName: 'Bob',
      lastName: 'Wilson',
      phone: '+1234567893',
      role: UserRole.CLIENT,
      isEmailVerified: true,
      clientProfile: {
        create: {
          dateOfBirth: new Date('1985-08-22'),
          gender: Gender.MALE,
          weight: 85.0,
          height: 180.0,
          fitnessGoal: 'Build muscle and increase strength',
          activityLevel: ActivityLevel.MODERATELY_ACTIVE,
          medicalConditions: ['Lower back issues'],
          preferences: {
            dietType: 'High Protein',
            workoutTime: 'Evening',
            equipment: 'Full gym access',
          },
        },
      },
    },
  });

  // Create Sample Subscriptions
  const subscription1 = await prisma.subscription.create({
    data: {
      clientId: client1.clientProfile.id,
      coachId: coach1.coachProfile.id,
      plan: SubscriptionPlan.MONTHLY,
      amount: 150.00,
      status: SubscriptionStatus.ACTIVE,
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      paymentMethod: PaymentMethod.CREDIT_CARD,
      paymentReference: 'stripe_pi_1234567890',
    },
  });

  const subscription2 = await prisma.subscription.create({
    data: {
      clientId: client2.clientProfile.id,
      coachId: coach2.coachProfile.id,
      plan: SubscriptionPlan.YEARLY,
      amount: 1200.00,
      status: SubscriptionStatus.ACTIVE,
      startDate: new Date(),
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
      paymentMethod: PaymentMethod.PAYPAL,
      paymentReference: 'paypal_txn_1234567890',
    },
  });

  // Create Sample Workout Plans
  const workoutPlan1 = await prisma.workoutPlan.create({
    data: {
      coachId: coach1.coachProfile.id,
      title: 'Beginner Strength Training',
      description: 'A comprehensive strength training program for beginners',
      difficulty: Difficulty.BEGINNER,
      duration: 45,
      category: 'Strength Training',
      equipment: ['Dumbbells', 'Bench', 'Resistance Bands'],
      exercises: {
        warmup: [
          { name: '5-minute walk', duration: 5, instructions: 'Light pace to warm up' }
        ],
        main: [
          { name: 'Push-ups', sets: 3, reps: 10, rest: 60 },
          { name: 'Squats', sets: 3, reps: 15, rest: 60 },
          { name: 'Dumbbell Rows', sets: 3, reps: 12, rest: 60 },
          { name: 'Plank', sets: 3, duration: 30, rest: 60 }
        ],
        cooldown: [
          { name: 'Stretching', duration: 10, instructions: 'Full body stretch' }
        ]
      },
      isPublic: true,
      isTemplate: true,
      tags: ['beginner', 'strength', 'full-body'],
    },
  });

  const workoutPlan2 = await prisma.workoutPlan.create({
    data: {
      coachId: coach2.coachProfile.id,
      title: 'Morning Yoga Flow',
      description: 'Energizing yoga sequence perfect for starting your day',
      difficulty: Difficulty.BEGINNER,
      duration: 30,
      category: 'Yoga',
      equipment: ['Yoga Mat'],
      exercises: {
        warmup: [
          { name: 'Deep Breathing', duration: 3, instructions: 'Prepare mind and body' }
        ],
        main: [
          { name: 'Sun Salutation A', sets: 3, instructions: 'Flow with breath' },
          { name: 'Warrior I', hold: 30, side: 'each' },
          { name: 'Downward Dog', hold: 60 },
          { name: 'Tree Pose', hold: 30, side: 'each' }
        ],
        cooldown: [
          { name: 'Savasana', duration: 5, instructions: 'Complete relaxation' }
        ]
      },
      isPublic: true,
      isTemplate: true,
      tags: ['yoga', 'morning', 'flexibility', 'beginner'],
    },
  });

  // Create Sample Nutrition Plans
  const nutritionPlan1 = await prisma.nutritionPlan.create({
    data: {
      coachId: coach1.coachProfile.id,
      title: 'Muscle Building Nutrition Plan',
      description: 'High protein meal plan designed to support muscle growth',
      totalCalories: 2500,
      macros: {
        protein: { grams: 150, percentage: 24 },
        carbs: { grams: 300, percentage: 48 },
        fats: { grams: 78, percentage: 28 }
      },
      meals: {
        breakfast: {
          name: 'Protein Pancakes',
          calories: 450,
          ingredients: ['Oats', 'Protein Powder', 'Eggs', 'Banana'],
          instructions: 'Blend ingredients and cook like pancakes'
        },
        lunch: {
          name: 'Chicken & Rice Bowl',
          calories: 650,
          ingredients: ['Chicken Breast', 'Brown Rice', 'Vegetables'],
          instructions: 'Grill chicken, serve over rice with steamed vegetables'
        },
        dinner: {
          name: 'Salmon & Sweet Potato',
          calories: 600,
          ingredients: ['Salmon Fillet', 'Sweet Potato', 'Asparagus'],
          instructions: 'Bake salmon and sweet potato, steam asparagus'
        },
        snacks: [
          { name: 'Greek Yogurt with Berries', calories: 200 },
          { name: 'Protein Shake', calories: 300 },
          { name: 'Mixed Nuts', calories: 300 }
        ]
      },
      dietType: 'High Protein',
      allergies: [],
      isPublic: true,
      isTemplate: true,
      tags: ['muscle-building', 'high-protein', 'balanced'],
    },
  });

  // Create Sample Reviews
  await prisma.review.create({
    data: {
      clientId: client1.clientProfile.id,
      coachId: coach1.coachProfile.id,
      rating: 5,
      comment: 'John is an amazing coach! His workout plans are challenging but achievable, and he provides great support throughout the journey.',
    },
  });

  await prisma.review.create({
    data: {
      clientId: client2.clientProfile.id,
      coachId: coach2.coachProfile.id,
      rating: 5,
      comment: 'Sarah\'s yoga classes have transformed my flexibility and mental well-being. Highly recommend!',
    },
  });

  console.log('✅ Database seeded successfully!');
  console.log('\n🔑 Demo Login Credentials:');
  console.log('Store Owner: owner@fitness.com / password123');
  console.log('Coach 1: john.coach@fitness.com / password123');
  console.log('Coach 2: sarah.yoga@fitness.com / password123');
  console.log('Client 1: alice.client@fitness.com / password123');
  console.log('Client 2: bob.client@fitness.com / password123');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });