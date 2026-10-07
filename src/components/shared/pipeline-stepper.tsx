import { cn } from "@/lib/utils";

export const PIPELINE_STEPS = [
  "Proposal Submission",
  "Director Approval",
  "Status Paper & Draft Upload",
  "Peer Review",
  "Final Approval & Publication",
] as const;

interface PipelineStepperProps {
  /** Zero-indexed current step. */
  currentStep: number;
}

export function PipelineStepper({ currentStep }: PipelineStepperProps) {
  return (
    <ol className="grid grid-cols-2 border border-ink md:grid-cols-5">
      {PIPELINE_STEPS.map((label, i) => {
        const done = i < currentStep;
        const active = i === currentStep;
        return (
          <li
            key={label}
            className={cn(
              "border-r border-line p-4 last:border-r-0",
              active && "bg-ink text-paper",
              done && "bg-paper-deep",
              i % 2 === 0 && "border-b md:border-b-0",
            )}
            aria-current={active ? "step" : undefined}
          >
            <span className="font-serif text-2xl leading-none opacity-55">
              {i + 1}
            </span>
            <p className="mt-2 text-xs font-semibold leading-snug">{label}</p>
          </li>
        );
      })}
    </ol>
  );
}