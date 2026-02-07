import { IconButton } from "@chakra-ui/react"
import { supportedLanguages } from "@/i18n"
import { useTranslation } from "react-i18next"
import { FiGlobe } from "react-icons/fi"
import {
	MenuContent,
	MenuItem,
	MenuRoot,
	MenuTrigger,
} from "@/components/ui/menu"

interface LanguageSwitcherProps {
	size?: "sm" | "md" | "lg"
	borderRadius?: string
	color?: string
}

export const LanguageSwitcher = ({
	size = "sm",
	borderRadius = "lg",
	color,
}: LanguageSwitcherProps) => {
	const { i18n } = useTranslation()

	const handleLanguageChange = (code: string) => {
		i18n.changeLanguage(code)
	}

	return (
		<MenuRoot>
			<MenuTrigger asChild>
				<IconButton
					aria-label="Change language"
					size={size}
					variant="ghost"
					borderRadius={borderRadius}
					color={color}
				>
					<FiGlobe />
				</IconButton>
			</MenuTrigger>
			<MenuContent>
				{supportedLanguages.map((lang) => (
					<MenuItem
						key={lang.code}
						value={lang.code}
						onClick={() => handleLanguageChange(lang.code)}
						fontWeight={i18n.language === lang.code ? "bold" : "normal"}
					>
						{lang.label}
					</MenuItem>
				))}
			</MenuContent>
		</MenuRoot>
	)
}
