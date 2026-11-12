export function notifyPlanningChanged() {
  if (typeof window !== 'undefined') window.dispatchEvent(new Event('lifeos:planning-changed'));
}
