import { db } from '../database.js';

const getFeedbackByDesignId = (designId) => {
    return db.prepare(
        `SELECT f.*,
                u.username AS admin_username
         FROM feedback f
         INNER JOIN users u ON u.id = f.admin_id
         WHERE f.design_id = ?`
    ).get(designId);
};

const upsertFeedback = (designId, adminId, rating, comments = '') => {
    db.prepare(
        `INSERT INTO feedback (design_id, admin_id, rating, comments)
         VALUES (?, ?, ?, ?)
         ON CONFLICT(design_id) DO UPDATE SET
            admin_id = excluded.admin_id,
            rating = excluded.rating,
            comments = excluded.comments,
            created_at = CURRENT_TIMESTAMP`
    ).run(designId, adminId, rating, comments);

    return getFeedbackByDesignId(designId);
};

export { getFeedbackByDesignId, upsertFeedback };
