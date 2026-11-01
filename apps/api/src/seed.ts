import mongoose from 'mongoose';
import * as bcrypt from 'bcryptjs';
import {
  User,
  Post,
  Reel,
  Comment,
  Like,
  Save,
  Follow,
  Story,
  Conversation,
  Message,
  Notification,
  Hashtag,
  TimeCapsule,
  WasteTimeLog,
  Streak,
  SwapChallenge,
  SwapDayMatch,
} from './models';
import { config } from './config/env';

async function main() {
  console.log('🌱 Seeding Swap database (MongoDB) with 10 demo creators & 100 random posts...');

  let mongod: any = null;
  try {
    await mongoose.connect(config.mongodbUri, { serverSelectionTimeoutMS: 2500 });
    console.log('Connected to MongoDB:', config.mongodbUri);
  } catch (err: any) {
    console.log('⚠️ Could not connect to configured MONGODB_URI (' + err.message + ').');
    console.log('Spawning in-memory MongoDB instance for local demonstration...');
    const { MongoMemoryServer } = await import('mongodb-memory-server');
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    await mongoose.connect(uri);
    console.log('✅ Connected to MongoDB Memory Server at:', uri);
  }

  // Clean collections
  await Promise.all([
    User.deleteMany({}),
    Post.deleteMany({}),
    Reel.deleteMany({}),
    Comment.deleteMany({}),
    Like.deleteMany({}),
    Save.deleteMany({}),
    Follow.deleteMany({}),
    Story.deleteMany({}),
    Conversation.deleteMany({}),
    Message.deleteMany({}),
    Notification.deleteMany({}),
    Hashtag.deleteMany({}),
    TimeCapsule.deleteMany({}),
    WasteTimeLog.deleteMany({}),
    Streak.deleteMany({}),
    SwapChallenge.deleteMany({}),
    SwapDayMatch.deleteMany({}),
  ]);
  console.log('🧹 Cleaned existing collections');

  const saltRounds = 10;
  const commonPasswordHash = await bcrypt.hash('Password123!', saltRounds);

  // 1. Create 10 Distinct Demo Creators
  const creatorsData = [
    {
      email: 'alex@swap.app',
      username: 'alex_swap',
      name: 'Alex Rivera',
      bio: 'Full-stack builder & platform engineer ⚡ Procrastinating intentionally in Waste of Time.',
      website: 'https://alexrivera.dev',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      activeVibe: 'CHILL',
      focusGuardMinutes: 30,
      currentStreakCount: 14,
      role: 'USER',
    },
    {
      email: 'maya@swap.app',
      username: 'maya_vibes',
      name: 'Maya Lin',
      bio: 'Visual designer & cyberpunk aesthetic curator 🎨 | Swapping vibes daily.',
      website: 'https://mayacreates.design',
      avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
      activeVibe: 'HYPE',
      focusGuardMinutes: 45,
      currentStreakCount: 14,
      role: 'USER',
    },
    {
      email: 'kai@swap.app',
      username: 'kai_creates',
      name: 'Kai Tanaka',
      bio: 'Streetwear & Motion Designer 🛹 | Duet challenge master.',
      website: 'https://instagram.com/kai_creates',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
      activeVibe: 'HYPE',
      focusGuardMinutes: 25,
      currentStreakCount: 10,
      role: 'USER',
    },
    {
      email: 'elena@swap.app',
      username: 'elena_sound',
      name: 'Elena Rostova',
      bio: 'Ambient Lo-Fi selector, traveler, and sunset chaser 🎧🌴',
      website: 'https://soundcloud.com/swap-sound',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
      activeVibe: 'CHILL',
      focusGuardMinutes: 20,
      currentStreakCount: 5,
      role: 'USER',
    },
    {
      email: 'chloe@swap.app',
      username: 'chloe_photo',
      name: 'Chloe Bennett',
      bio: 'Architectural & cinematic film photographer 📷 Chasing brutalist shadows and golden hours.',
      website: 'https://chloebennett.photo',
      avatarUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80',
      activeVibe: 'FOCUS',
      focusGuardMinutes: 35,
      currentStreakCount: 8,
      role: 'USER',
    },
    {
      email: 'marcus@swap.app',
      username: 'marcus_dev',
      name: 'Marcus Vance',
      bio: 'Distributed systems architect & open-source hacker 💻 Shipping realtime features.',
      website: 'https://github.com/marcusvance',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
      activeVibe: 'FOCUS',
      focusGuardMinutes: 40,
      currentStreakCount: 7,
      role: 'USER',
    },
    {
      email: 'zara@swap.app',
      username: 'zara_culinary',
      name: 'Zara Chen',
      bio: 'Specialty coffee alchemist & modernist pastry chef ☕ Experiments in fermented flavors.',
      website: 'https://zarachen.cafe',
      avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
      activeVibe: 'CHILL',
      focusGuardMinutes: 30,
      currentStreakCount: 9,
      role: 'USER',
    },
    {
      email: 'noah@swap.app',
      username: 'noah_wander',
      name: 'Noah Thorne',
      bio: 'Alpine expedition filmmaker & drone pilot 🏔️ Living out of a 4x4 camper.',
      website: 'https://noahthorne.film',
      avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80',
      activeVibe: 'HYPE',
      focusGuardMinutes: 20,
      currentStreakCount: 12,
      role: 'USER',
    },
    {
      email: 'aria@swap.app',
      username: 'aria_code',
      name: 'Aria Patel',
      bio: 'Creative technologist & generative art explorer 🤖 Teaching neural nets to paint memories.',
      website: 'https://ariapatel.ai',
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
      activeVibe: 'FOCUS',
      focusGuardMinutes: 30,
      currentStreakCount: 11,
      role: 'USER',
    },
    {
      email: 'admin@swap.app',
      username: 'swap_admin',
      name: 'Swap Official Team',
      bio: 'Swap Platform Core Operations, Featured Creators, & Moderation Desk 🛡️',
      website: 'https://swap.app',
      avatarUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80',
      activeVibe: 'DARK',
      focusGuardMinutes: 0,
      currentStreakCount: 0,
      role: 'ADMIN',
    },
  ];

  const users: any[] = [];
  for (const c of creatorsData) {
    const user = await User.create({
      ...c,
      passwordHash: commonPasswordHash,
      isEmailVerified: true,
      isPrivate: false,
      ghostMode: false,
    });
    users.push(user);
  }

  const [userAlex, userMaya, userKai, userElena, userChloe, userMarcus, userZara, userNoah, userAria, userAdmin] = users;
  console.log(`✅ Created ${users.length} demo creator accounts`);

  // 2. Interconnected Mutual Follows
  const followPairs: any[] = [];
  for (let i = 0; i < users.length; i++) {
    for (let j = 0; j < users.length; j++) {
      if (i !== j && (i + j) % 2 === 0) {
        followPairs.push({
          follower: users[i]._id,
          following: users[j]._id,
          status: 'ACCEPTED',
        });
      }
    }
  }
  await Follow.create(followPairs);

  // Update follow counts
  for (const u of users) {
    const [followersCount, followingCount] = await Promise.all([
      Follow.countDocuments({ following: u._id, status: 'ACCEPTED' }),
      Follow.countDocuments({ follower: u._id, status: 'ACCEPTED' }),
    ]);
    await User.findByIdAndUpdate(u._id, { $set: { followersCount, followingCount } });
  }

  // 3. Hashtags
  await Hashtag.create([
    { name: 'swap', postCount: 45, reelCount: 12 },
    { name: 'vibes', postCount: 38, reelCount: 10 },
    { name: 'wasteoftime', postCount: 28, reelCount: 15 },
    { name: 'duet', postCount: 14, reelCount: 8 },
    { name: 'nightlife', postCount: 22, reelCount: 9 },
    { name: 'tokyo', postCount: 19, reelCount: 7 },
    { name: 'architecture', postCount: 16, reelCount: 4 },
    { name: 'creative', postCount: 31, reelCount: 11 },
    { name: 'coffee', postCount: 15, reelCount: 3 },
    { name: 'buildinpublic', postCount: 24, reelCount: 6 },
  ]);

  // 4. Photo Assets Pool (100 distinct aesthetic images from Unsplash)
  const photoPool = [
    // City & Cyberpunk
    'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1542051841857-5f90071e7989?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1477959858617-67f30bc75b82?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
    // Architecture & Interior
    'https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1517581177682-a085bb7ffb15?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1600565193348-f74bd3c7ccdf?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
    // Coffee & Food
    'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1509785307050-d4066910ec1e?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1442512595331-e89e73853f31?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1498804103079-a6351b050096?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?auto=format&fit=crop&w=1200&q=80',
    // Tech & Code
    'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=80',
    // Nature, Alpine & Adventure
    'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=1200&q=80',
    // Streetwear & Urban Fashion
    'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=1200&q=80',
    // Music & Synths
    'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=1200&q=80',
  ];

  const locations = [
    'Tokyo Shibuya Sky',
    'SoHo, New York',
    'Kreuzberg, Berlin',
    'Marina District, San Francisco',
    'Le Marais, Paris',
    'Reykjavik Glacier Valley',
    'Gangnam District, Seoul',
    'Kyoto Design Studio',
    'Shoreditch, London',
    'Canggu Beach, Bali',
    'Zurich Altstadt, Switzerland',
    'Central, Hong Kong',
    'Fitzroy, Melbourne',
    'Venice Beach, California',
    'Shinjuku Gyoen, Tokyo',
    'Milan Fashion Quarter',
    'Amsterdam Jordaan',
    'Chiang Mai Old City',
    'Stockholm Södermalm',
    'Cape Town Camps Bay',
  ];

  const postTemplates = [
    { text: 'Late night generative design sessions hitting differently under neon light. 🌌 What vibe are you on today? #swap #vibes', mood: 'CURIOUS' },
    { text: 'Studio setup refresh for autumn. Minimalist brutalism with warm amber accents. 🍁 #swap #vibes', mood: 'CHILL' },
    { text: 'Prototyping fluid glassmorphism cards with smooth Framer Motion spring physics. Zero lag. ⚡ #swap #buildinpublic', mood: 'MOTIVATED' },
    { text: 'First espresso dialed in at 9 bars. Peach notes and velvet crema to kick off today’s creative sprint. ☕ #coffee #vibes', mood: 'FOCUS' },
    { text: '35mm grain from Shibuya crossing at midnight. The light never turns off here. 📸✨ #tokyo #nightlife #filmphotography', mood: 'CHILL' },
    { text: 'Summit ridge at 3,200 meters. Thin air, silent valley, pure presence. 🏔️ #adventure #wasteoftime #nature', mood: 'MOTIVATED' },
    { text: 'Analog synthesizer experiments: routing tape echo through modular filters for the new ambient EP. 🎛️🎧 #sounddesign #swap', mood: 'FOCUS' },
    { text: 'New oversized streetwear silhouette dropped today. Raw denim and reflective stitching. 🔥🛹 #streetwear #hype', mood: 'HYPE' },
    { text: 'Teaching a latent diffusion model to dream in Japanese woodblock textures. The outputs are surreal. 🤖🎨 #creative #tokyo', mood: 'CURIOUS' },
    { text: 'When you tell yourself "5 minutes in Waste of Time" and your Focus Guard breathing orb pops up 💀 #wasteoftime #swap', mood: 'FUNNY' },
    { text: 'Golden hour hitting the brutalist concrete gallery. Shadows stretching like sundials. 🏛️✨ #architecture #minimalism', mood: 'FOCUS' },
    { text: 'Nordic dusk reflections over the harbor. Sub-zero temperatures and hot cedar sauna waiting. ❄️🧖‍♂️ #travel #chill', mood: 'CHILL' },
    { text: 'Deploying the new MongoDB compound index migration. Query latency dropped from 84ms to 9ms! 🚀⚡ #buildinpublic #swap', mood: 'MOTIVATED' },
    { text: 'Single origin pour-over paired with lo-fi beats. Perfect afternoon focus flow. ☕🎧 #coffee #focus', mood: 'FOCUS' },
    { text: 'Night market neon in Taipei. The steamed dumpling steam catching the magenta lantern glow. 🏮🍜 #nightlife #travel', mood: 'HYPE' },
    { text: 'Testing our new split-screen Swap Duet feature! Who wants to challenge this 10-second beat drop? 🔄🎶 #duet #swap', mood: 'HYPE' },
    { text: 'Found this hidden alleyway vinyl cafe in Kyoto. Thousands of jazz records and dark roast brew. 🎷☕ #japan #chill', mood: 'CHILL' },
    { text: 'Morning calisthenics on the rooftop overlooking the misty skyline. Routine is freedom. 🤸‍♂️🌅 #fitness #motivated', mood: 'MOTIVATED' },
    { text: 'Midnight rain on the studio skylight. The best soundtrack for shipping code. 🌧️💻 #buildinpublic #swap', mood: 'CHILL' },
    { text: 'Sealed a secret roadmap inside a Time Capsule! Auto-unlocking in 7 days for our top supporters 🔒⏳ #swap #buildinpublic', mood: 'CURIOUS' },
  ];

  // 5. Generate 100 Realistic Posts
  console.log('📸 Generating 100 realistic posts across all 10 creators...');
  const createdPosts: any[] = [];
  const now = Date.now();

  for (let i = 0; i < 100; i++) {
    const author = users[i % users.length];
    const template = postTemplates[i % postTemplates.length];
    const location = locations[i % locations.length];
    const photoUrl = photoPool[i % photoPool.length];
    const secondPhotoUrl = (i % 3 === 0) ? photoPool[(i + 7) % photoPool.length] : null;

    // Distribute timestamps over the past 14 days
    const hoursAgo = Math.floor((i / 100) * 14 * 24);
    const postCreatedAt = new Date(now - hoursAgo * 3600 * 1000 - (i % 60) * 60 * 1000);

    const media = [
      {
        url: photoUrl,
        type: 'IMAGE',
        width: 1200,
        height: 800,
        order: 0,
      },
    ];

    if (secondPhotoUrl) {
      media.push({
        url: secondPhotoUrl,
        type: 'IMAGE',
        width: 1200,
        height: 800,
        order: 1,
      });
    }

    const likesCount = 20 + Math.floor((i * 17) % 320);
    const commentsCount = 2 + Math.floor((i * 7) % 45);
    const savesCount = 3 + Math.floor((i * 11) % 60);

    const post = await Post.create({
      author: author._id,
      caption: `${template.text} (Moment #${100 - i})`,
      location,
      mood: template.mood,
      media,
      hashtags: ['swap', template.mood.toLowerCase(), 'vibes'],
      likesCount,
      commentsCount,
      savesCount,
      createdAt: postCreatedAt,
      updatedAt: postCreatedAt,
    });

    createdPosts.push(post);
  }

  // Update user post counts
  for (const u of users) {
    const count = await Post.countDocuments({ author: u._id, deletedAt: null });
    await User.findByIdAndUpdate(u._id, { $set: { postsCount: count } });
  }
  console.log(`✅ Created 100 posts across 10 creators!`);

  // 6. Seed Comments on Top Posts
  const topPosts = createdPosts.slice(0, 15);
  for (const post of topPosts) {
    const commenter1 = users[(Math.floor(Math.random() * users.length))];
    const commenter2 = users[(Math.floor(Math.random() * users.length))];

    const c1 = await Comment.create({
      author: commenter1._id,
      post: post._id,
      content: 'Incredible color palette and atmosphere on this capture! 🔥',
      likesCount: 3,
    });

    if (commenter1._id.toString() !== commenter2._id.toString()) {
      await Comment.create({
        author: commenter2._id,
        post: post._id,
        parent: c1._id,
        content: 'Totally agreed! Was this shot on 35mm or digital LUT? ✨',
        likesCount: 1,
      });
    }
  }

  // 7. Seed Likes from Alex on a subset of posts so the logged-in demo user has liked states
  const likesToSeed = createdPosts.slice(0, 25).map((p) => ({
    user: userAlex._id,
    post: p._id,
  }));
  await Like.create(likesToSeed);

  // 8. "Waste of Time" Reels (including Swap Duet)
  const reel1 = await Reel.create({
    author: userMaya._id,
    caption: 'Midnight Tokyo Hyperlapse in rain. POV: swapping vibes through Akihabara at 2 AM. 🌧️✨ #swap #nightlife',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-vertical-view-of-a-neon-sign-at-night-42289-large.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=600&q=80',
    duration: 14.5,
    audioName: 'Swap Synthwave - Midnight Rain',
    mood: 'CHILL',
    viewCount: 1420,
    likesCount: 28,
    commentsCount: 6,
    hashtags: ['swap', 'nightlife'],
  });

  const reel2 = await Reel.create({
    author: userElena._id,
    coAuthor: userAlex._id,
    collabStatus: 'ACCEPTED',
    caption: 'When you tell yourself "just one reel before bed" and now it is 3:45 AM 💀 #wasteoftime #vibes',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-hands-holding-a-smartphone-scrolling-through-social-media-42354-large.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1512428559087-560fa5ceab42?auto=format&fit=crop&w=600&q=80',
    duration: 18.2,
    audioName: 'Original Audio - Elena x Alex',
    mood: 'FUNNY',
    viewCount: 3890,
    likesCount: 45,
    commentsCount: 12,
    hashtags: ['wasteoftime', 'vibes'],
  });

  const reel3 = await Reel.create({
    author: userKai._id,
    caption: 'Part 1: Dropping the 10-second motion design workflow 🎨 Who wants to swap reels? #swap #duet',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-hands-typing-on-a-laptop-keyboard-41718-large.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=600&q=80',
    duration: 12.0,
    audioName: 'Cyber Ambient Flow - 130 BPM',
    mood: 'MOTIVATED',
    viewCount: 2150,
    likesCount: 32,
    commentsCount: 4,
    hashtags: ['swap', 'duet'],
  });

  const reel4DuetReply = await Reel.create({
    author: userMaya._id,
    caption: 'Part 2 (Swap Duet): Replying to @kai_creates with my 3D rendering pipeline! 🚀 #swap #duet',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-vertical-view-of-a-neon-sign-at-night-42289-large.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=600&q=80',
    duration: 12.0,
    audioName: 'Cyber Ambient Flow - 130 BPM',
    mood: 'MOTIVATED',
    duetParentReel: reel3._id,
    viewCount: 1840,
    likesCount: 39,
    commentsCount: 8,
    hashtags: ['swap', 'duet'],
  });

  await User.findByIdAndUpdate(userMaya._id, { $inc: { reelsCount: 2 } });
  await User.findByIdAndUpdate(userElena._id, { $inc: { reelsCount: 1 } });
  await User.findByIdAndUpdate(userKai._id, { $inc: { reelsCount: 1 } });

  // 9. Swap Challenge & Duet Model Pair
  await SwapChallenge.create({
    initiator: userKai._id,
    recipient: userMaya._id,
    prompt: 'Drop your fastest creative workflow in under 15 seconds! ⏱️🎨',
    initiatorReel: reel3._id,
    replyReel: reel4DuetReply._id,
    status: 'COMPLETED',
    isDuet: true,
    completedAt: new Date(),
  });

  // 10. Swap Day Mutual Match
  const todayStr = new Date().toISOString().split('T')[0];
  await SwapDayMatch.create({
    user1: userAlex._id,
    user2: userMaya._id,
    date: todayStr,
    user1VibeNote: 'Your Shibuya Cyberpunk reel is setting the mood in Tokyo! Incredible eye for color gradients. ✨',
    user2VibeNote: 'The fluid spring physics on the Swap feed cards are buttery smooth. Top tier frontend engineering! ⚡',
  });

  // 11. 24-Hour Stories (Active, non-expired)
  const tomorrow = new Date(Date.now() + 24 * 3600 * 1000);
  await Story.create([
    {
      author: userMaya._id,
      mediaUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80',
      caption: 'Tokyo 2 AM rain aesthetics 🌧️',
      expiresAt: tomorrow,
    },
    {
      author: userKai._id,
      mediaUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80',
      caption: 'Late night keyframes rendering 💻',
      expiresAt: tomorrow,
    },
    {
      author: userElena._id,
      mediaUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80',
      caption: 'New Lo-Fi tape loop dialed in 🎧',
      expiresAt: tomorrow,
    },
    {
      author: userChloe._id,
      mediaUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80',
      caption: 'Golden hour reflections on glass towers 🌇',
      expiresAt: tomorrow,
    },
  ]);

  // 12. Realtime Chat Conversation & Messages
  const conversation = await Conversation.create({
    isGroup: false,
    participants: [
      { user: userAlex._id, lastReadAt: new Date(), joinedAt: new Date() },
      { user: userMaya._id, lastReadAt: new Date(), joinedAt: new Date() },
    ],
  });

  await Message.create([
    {
      conversation: conversation._id,
      sender: userMaya._id,
      type: 'TEXT',
      content: 'Hey Alex! Did you check out the new Swap Duets split-screen feature? 🚀',
    },
    {
      conversation: conversation._id,
      sender: userAlex._id,
      type: 'TEXT',
      content: 'Just tested it! The side-by-side synchronized playback is super fast. Ready for Swap Day tomorrow? ☀️',
    },
  ]);

  // 13. Streaks
  await Streak.create({
    user1: userAlex._id,
    user2: userMaya._id,
    currentStreak: 14,
    longestStreak: 14,
    lastInteractionAt: new Date(),
    expiresAt: new Date(Date.now() + 20 * 3600 * 1000),
  });

  // 14. Time Wasted Logs
  await WasteTimeLog.create([
    {
      user: userAlex._id,
      reel: reel1._id,
      watchDurationSeconds: 120,
      completedFullReel: true,
      date: todayStr,
    },
    {
      user: userAlex._id,
      reel: reel2._id,
      watchDurationSeconds: 180,
      completedFullReel: true,
      date: todayStr,
    },
  ]);

  // 15. Time Capsules
  await TimeCapsule.create([
    {
      author: userAlex._id,
      title: 'Swap 3.0 Architecture Blueprint & Roadmap',
      caption: 'Secret roadmap reveals, Figma master tokens, and our next feature drafts!',
      mediaUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80',
      unlocksAt: new Date(Date.now() + 6 * 24 * 3600 * 1000),
      isUnlocked: false,
    },
    {
      author: userMaya._id,
      title: 'Cyberpunk 4K Wallpaper Pack [UNLOCKED]',
      caption: 'Surprise! High-res Tokyo neon wallpaper collection curated from our shoots!',
      mediaUrl: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=1200&q=80',
      unlocksAt: new Date(Date.now() - 3600 * 1000),
      isUnlocked: true,
    },
  ]);

  // 16. Notifications
  await Notification.create([
    {
      recipient: userAlex._id,
      actor: userMaya._id,
      type: 'SWAP_DAY_MATCH',
      previewText: 'You and @maya_vibes are today’s Swap Day pair!',
      read: false,
    },
    {
      recipient: userKai._id,
      actor: userAlex._id,
      type: 'SWAP_CHALLENGE_INVITE',
      previewText: 'Alex challenged you: "Drop your best late-night coding anthem 🎧"',
      read: false,
    },
  ]);

  console.log('🎉 Swap database seeded successfully with 10 creators, 100 posts, reels, duets, Swap Day match, stories, and chat!');
  await mongoose.disconnect();
  if (mongod) {
    await mongod.stop();
  }
}

main().catch((err) => {
  console.error('❌ Seeding error:', err);
  process.exit(1);
});
