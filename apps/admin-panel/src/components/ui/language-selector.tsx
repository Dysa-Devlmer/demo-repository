'use client';

import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Globe } from 'lucide-react'
import { useTranslation } from '@/hooks/useTranslation'
import { languages, locales, type Locale } from '@/lib/i18n'

export function LanguageSelector() {
  const { locale, changeLocale, isLoading } = useTranslation()

  const handleLanguageChange = (newLocale: string) => {
    changeLocale(newLocale as Locale)
  }

  const getCurrentLanguage = () => {
    return languages[locale] || languages['es']
  }

  if (isLoading) {
    return (
      <div className="flex items-center space-x-2 opacity-50">
        <Globe className="h-4 w-4" />
        <span className="text-sm">Cargando...</span>
      </div>
    )
  }

  const currentLang = getCurrentLanguage()

  return (
    <div className="flex items-center space-x-2">
      <Globe className="h-4 w-4 text-muted-foreground" />
      <Select
        value={locale}
        onValueChange={handleLanguageChange}
      >
        <SelectTrigger className="w-[140px] h-8">
          <SelectValue>
            <div className="flex items-center space-x-2">
              <span>{currentLang.flag}</span>
              <span className="text-sm">{currentLang.name}</span>
            </div>
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {locales.map((lang) => (
            <SelectItem key={lang} value={lang}>
              <div className="flex items-center space-x-2">
                <span>{languages[lang].flag}</span>
                <span>{languages[lang].name}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

export default LanguageSelector