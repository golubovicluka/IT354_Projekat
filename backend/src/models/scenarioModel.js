import { db } from '../database.js';

const getAllScenarios = () => {
    return db.prepare('SELECT * FROM scenarios ORDER BY created_at DESC').all();
};

const getScenarioById = (id) => {
    return db.prepare('SELECT * FROM scenarios WHERE id = ?').get(id);
};

const createScenario = ({
    title,
    description,
    difficulty,
    functionalRequirements = null,
    nonFunctionalRequirements = null,
    capacityEstimations = null
}) => {
    const result = db.prepare(
        `INSERT INTO scenarios (
            title,
            description,
            difficulty,
            functional_requirements,
            non_functional_requirements,
            capacity_estimations
        ) VALUES (?, ?, ?, ?, ?, ?)`
    ).run(
        title,
        description,
        difficulty,
        functionalRequirements,
        nonFunctionalRequirements,
        capacityEstimations
    );
    return getScenarioById(result.lastInsertRowid);
};

const updateScenario = (
    id,
    {
        title,
        description,
        difficulty,
        functionalRequirements = null,
        nonFunctionalRequirements = null,
        capacityEstimations = null
    }
) => {
    db.prepare(
        `UPDATE scenarios
         SET title = ?,
             description = ?,
             difficulty = ?,
             functional_requirements = ?,
             non_functional_requirements = ?,
             capacity_estimations = ?
         WHERE id = ?`
    ).run(
        title,
        description,
        difficulty,
        functionalRequirements,
        nonFunctionalRequirements,
        capacityEstimations,
        id
    );
    return getScenarioById(id);
};

const deleteScenarioTransaction = db.transaction((id) => {
    db.prepare(
        `DELETE FROM feedback
         WHERE design_id IN (
            SELECT id
            FROM designs
            WHERE scenario_id = ?
         )`
    ).run(id);

    db.prepare('DELETE FROM designs WHERE scenario_id = ?').run(id);

    return db.prepare('DELETE FROM scenarios WHERE id = ?').run(id);
});

const deleteScenario = (id) => {
    return deleteScenarioTransaction(id);
};

export { getAllScenarios, getScenarioById, createScenario, updateScenario, deleteScenario };
