import i18n from "i18next"
import LanguageDetector from "i18next-browser-languagedetector"
import { initReactI18next } from "react-i18next"

import enAdmin from "./locales/en/admin.json"
import enAuth from "./locales/en/auth.json"
import enChat from "./locales/en/chat.json"
import enCommon from "./locales/en/common.json"
import enDashboard from "./locales/en/dashboard.json"
import enItems from "./locales/en/items.json"
import enNavigation from "./locales/en/navigation.json"
import enNotFound from "./locales/en/notFound.json"
import enProjects from "./locales/en/projects.json"
import enSettings from "./locales/en/settings.json"

import esAdmin from "./locales/es/admin.json"
import esAuth from "./locales/es/auth.json"
import esChat from "./locales/es/chat.json"
import esCommon from "./locales/es/common.json"
import esDashboard from "./locales/es/dashboard.json"
import esItems from "./locales/es/items.json"
import esNavigation from "./locales/es/navigation.json"
import esNotFound from "./locales/es/notFound.json"
import esProjects from "./locales/es/projects.json"
import esSettings from "./locales/es/settings.json"

export const supportedLanguages = [
	{ code: "en", label: "English" },
	{ code: "es", label: "Español" },
] as const

export type LanguageCode = (typeof supportedLanguages)[number]["code"]

i18n
	.use(LanguageDetector)
	.use(initReactI18next)
	.init({
		resources: {
			en: {
				common: enCommon,
				auth: enAuth,
				navigation: enNavigation,
				dashboard: enDashboard,
				settings: enSettings,
				items: enItems,
				admin: enAdmin,
				chat: enChat,
				projects: enProjects,
				notFound: enNotFound,
			},
			es: {
				common: esCommon,
				auth: esAuth,
				navigation: esNavigation,
				dashboard: esDashboard,
				settings: esSettings,
				items: esItems,
				admin: esAdmin,
				chat: esChat,
				projects: esProjects,
				notFound: esNotFound,
			},
		},
		fallbackLng: "en",
		defaultNS: "common",
		interpolation: {
			escapeValue: false,
		},
		detection: {
			order: ["localStorage", "navigator"],
			caches: ["localStorage"],
			lookupLocalStorage: "i18nextLng",
		},
	})

export default i18n
