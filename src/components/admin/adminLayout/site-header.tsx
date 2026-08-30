import { Separator } from "../../ui/separator";
import { SidebarTrigger } from "../../admin/adminLayout/sidebar";
import { ModeToggle } from "../../mode-toggle";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../../ui/dropdown-menu";
import { Button } from "../../ui/button";
import { ChevronDown, Globe } from "lucide-react";
import { useTranslation } from "react-i18next";
import { setLanguage } from "../../../i18n";

export function SiteHeader() {
  const { i18n } = useTranslation();

  // Language change handler — setLanguage now handles translations, the
  // document direction, and persisting the choice.
  const changeLanguage = (lng: string) => {
    setLanguage(lng);
  };

  // Get current language code
  const getCurrentLanguageCode = () => {
    const lang = i18n.language;
    if (lang.startsWith("en")) return "EN";
    if (lang.startsWith("fr")) return "FR";
    if (lang.startsWith("ar")) return "AR";
    return "EN";
  };

  return (
    <header className="sticky top-0 z-50 bg-background flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <div className="ml-auto flex items-center gap-2">
          {/* Language Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" >
                  <Globe className="h-4 w-4 mr-1" />
                  {getCurrentLanguageCode()}
                  <ChevronDown className="h-3 w-3 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => changeLanguage("en")}>
                  English
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => changeLanguage("fr")}>
                  Français
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => changeLanguage("ar")}>
                  العربية
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          <ModeToggle></ModeToggle>
        </div>
      </div>
    </header>
  );
}
