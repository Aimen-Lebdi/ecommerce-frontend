import SidebarBrands from "./SidebarBrands";
import SidebarCategory from "./SidebarCategory";
import SidebarPrice from "./SidebarPrice";
import SidebarTags from "./SidebarTags";

const Sidebar = () => {
  return (
    <aside className="w-full lg:w-1/4 space-y-8 text-sm text-secondary">
      <SidebarCategory />
      <SidebarPrice />
      <SidebarBrands />
      <SidebarTags />
    </aside>
  );
};

export default Sidebar;
