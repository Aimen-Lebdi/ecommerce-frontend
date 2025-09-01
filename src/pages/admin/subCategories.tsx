import  { AddSubCategoryDialog } from "../../components/AddSubCategoryDialog";
import { DataTable } from "../../components/admin/dashboard/data-table";

import data from "../../dummyData/data.json";

export default function SubCategories() {
  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <DataTable data={data} dialogComponent={<AddSubCategoryDialog />} />
        </div>
      </div>
    </div>
  );
}
