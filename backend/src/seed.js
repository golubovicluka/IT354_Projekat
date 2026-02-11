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
                functional_requirements: JSON.stringify([
                    "Users should be able to enter a long URL and get a short link",
                    "Users should be redirected to the original URL when visiting the short link",
                    "Links should have an optional expiration date",
                    "Users should be able to see basic analytics (click counts)"
                ]),
                non_functional_requirements: JSON.stringify([
                    "Highly Available (Read-heavy system)",
                    "Low Latency (Redirection must be instant)",
                    "Minimal Storage (Optimized hash storage)"
                ]),
                capacity_estimations: JSON.stringify({
                    "daily_active_users": "1M",
                    "urls_per_day": "100K",
                    "rps": "1.15 Read / 0.11 Write",
                    "daily_storage": "50 MB"
                })
            },
            {
                title: "Design Twitter",
                description: "Design a social media platform for short-form content",
                difficulty: "MEDIUM",
                functional_requirements: JSON.stringify([
                    "Users should be able to post tweets (max 280 chars)",
                    "Users should be able to follow/unfollow others",
                    "Users should see a timeline of tweets from followees",
                    "Users should be able to search for tweets by keyword or hashtag"
                ]),
                non_functional_requirements: JSON.stringify([
                    "Highly Scalable (Support 100M+ users)",
                    "High Availability (Eventual consistency for timelines is okay)",
                    "Low Latency (Timeline generation must be fast)"
                ]),
                capacity_estimations: JSON.stringify({
                    "daily_active_users": "100M",
                    "tweets_per_day": "500M",
                    "rps": "5.7K Write / 100K+ Read",
                    "daily_storage": "1 TB"
                })
            },
            {
                title: "Design Uber",
                description: "Design a ride-sharing platform with real-time matching",
                difficulty: "HARD",
                functional_requirements: JSON.stringify([
                    "Users should be able to see all the cabs available with minimum price and ETA",
                    "Users should be able to book a cab for their destination",
                    "Users should be able to see the location of the driver",
                    "Users should be able to cancel their ride whenever they want"
                ]),
                non_functional_requirements: JSON.stringify([
                    "High Availability",
                    "High Reliability",
                    "Highly Scalable",
                    "Low Latency"
                ]),
                capacity_estimations: JSON.stringify({
                    "active_users": "5M",
                    "drivers": "200K",
                    "daily_rides": "1M",
                    "rps": "58",
                    "daily_storage": "2.32 GB"
                })
            }
        ];

        const insertScenario = db.prepare(`
            INSERT INTO scenarios (title, description, difficulty, functional_requirements, non_functional_requirements, capacity_estimations)
            VALUES (@title, @description, @difficulty, @functional_requirements, @non_functional_requirements, @capacity_estimations)
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
