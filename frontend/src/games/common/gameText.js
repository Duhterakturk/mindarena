import { useTranslation } from "react-i18next";

export function useGameText(slug, vars) {
  const { t } = useTranslation();
  return {
    title: t(`gameTitle.${slug}`),
    rules: t(`gameRules.${slug}`, vars),
  };
}
