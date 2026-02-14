import { Badge } from '@/components/ui/badge';
import { getDifficultyBadgeClassName } from '@/lib/badgeStyles';
import { cn } from '@/lib/utils';

const ScenarioInfoPanel = ({
  description,
  functionalRequirements = [],
  nonFunctionalRequirements = [],
  capacityEstimations,
  showDifficulty = false,
  difficulty = '',
  containerClassName,
  capacityClassName = 'max-h-[50vh]',
}) => {
  return (
    <div className={cn('space-y-4', containerClassName)}>
      {showDifficulty && (
        <div>
          <p className="mb-1 text-sm font-medium">Difficulty</p>
          <Badge className={getDifficultyBadgeClassName(difficulty)}>
            {difficulty}
          </Badge>
        </div>
      )}

      <div>
        <p className="mb-1 text-sm font-medium">Description</p>
        <p className="text-muted-foreground whitespace-pre-wrap text-sm">
          {description}
        </p>
      </div>

      <div>
        <p className="mb-1 text-sm font-medium">Functional Requirements</p>
        {functionalRequirements.length > 0 ? (
          <ul className="text-muted-foreground list-disc space-y-1 pl-5 text-sm">
            {functionalRequirements.map((requirement, index) => (
              <li key={`functional-${index}`}>{String(requirement)}</li>
            ))}
          </ul>
        ) : (
          <p className="text-muted-foreground text-sm">
            No functional requirements provided.
          </p>
        )}
      </div>

      <div>
        <p className="mb-1 text-sm font-medium">Non-Functional Requirements</p>
        {nonFunctionalRequirements.length > 0 ? (
          <ul className="text-muted-foreground list-disc space-y-1 pl-5 text-sm">
            {nonFunctionalRequirements.map((requirement, index) => (
              <li key={`non-functional-${index}`}>{String(requirement)}</li>
            ))}
          </ul>
        ) : (
          <p className="text-muted-foreground text-sm">
            No non-functional requirements provided.
          </p>
        )}
      </div>

      <div>
        <p className="mb-1 text-sm font-medium">Capacity Estimations</p>
        <pre
          className={cn(
            'bg-muted overflow-auto rounded-md p-3 text-xs whitespace-pre-wrap break-words',
            capacityClassName
          )}
        >
          {capacityEstimations}
        </pre>
      </div>
    </div>
  );
};

export default ScenarioInfoPanel;
