import { AddCategoryDialog } from "../../components/AddCategoryDialog";
import { DataTable } from "../../components/admin/dashboard/data-table";

import data from "../../dummyData/data.json";

export default function Categories() {
  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <DataTable dialogComponent={<AddCategoryDialog />} data={data} />
        </div>
      </div>
    </div>
  );
}
