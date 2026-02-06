import { db } from './database.js';
import { createUser } from './models/userModel.js';

const seed = () => {
    const userCount = db.prepare('SELECT count(*) as count FROM users').get().count;

    if (userCount > 0) return;

    console.log('Seeding database...');

    try {
        createUser('admin', 'admin@architex.com', 'admin123', 'ADMIN');
        createUser('user', 'user@architex.com', 'user123', 'USER');

        const scenarios = [
            {
                title: "Design URL Shortener",
                description: "Design a URL shortening service like bit.ly",
                difficulty: "EASY",
                constraints: JSON.stringify({ "users": "1M", "urls_per_day": "100K", "latency": "100ms" })
            },
            {
                title: "Design Twitter",
                description: "Design a social media platform for short-form content",
                difficulty: "MEDIUM",
                constraints: JSON.stringify({ "users": "100M", "tweets_per_day": "500M", "latency": "200ms" })
            },
            {
                title: "Design Uber",
                description: "Design a ride-sharing platform with real-time matching",
                difficulty: "HARD",
                constraints: JSON.stringify({ "users": "50M", "rides_per_day": "10M", "latency": "50ms" })
            }
        ];

        const insertScenario = db.prepare(`
            INSERT INTO scenarios (title, description, difficulty, constraints)
            VALUES (@title, @description, @difficulty, @constraints)
        `);

        const insertMany = db.transaction((scenarios) => {
            for (const scenario of scenarios) insertScenario.run(scenario);
        });

        insertMany(scenarios);
    } catch (error) {
        console.error('Seeding error:', error);
    }
};

export default seed;
