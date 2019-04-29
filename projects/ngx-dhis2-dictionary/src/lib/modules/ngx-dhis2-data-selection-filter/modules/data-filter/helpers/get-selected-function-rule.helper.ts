export function getSelectedFunctionRule(
  functionRulesIds: string[],
  previousSelectedRule: string
) {
  return (functionRulesIds || []).indexOf(previousSelectedRule) === -1
    ? (functionRulesIds || [])[0]
    : previousSelectedRule;
}
