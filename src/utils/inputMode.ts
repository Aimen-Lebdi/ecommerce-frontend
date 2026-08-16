import type { ComponentProps } from "react"

type InputType = ComponentProps<"input">["type"]
type InputStep = ComponentProps<"input">["step"]
type InputMode = ComponentProps<"input">["inputMode"]

/**
 * Infers the correct mobile keypad (`inputMode`) from an input's `type`/`step`.
 * - `type="tel"`   -> `"tel"`     (phone keypad)
 * - `type="number"` with a fractional `step` (contains "." or is "any") -> `"decimal"`
 * - `type="number"` otherwise -> `"numeric"`
 * - any other type -> `undefined` (attribute left unset)
 */
export function inferInputMode(
  type: InputType,
  step?: InputStep
): InputMode {
  if (type === "tel") return "tel"
  if (type === "number") {
    if (step === "any" || String(step).includes(".")) return "decimal"
    return "numeric"
  }
  return undefined
}
