import { ChartAreaInteractive } from "../../components/admin/dashboard/chart-area-interactive";
import { DashboardTables } from "../../components/admin/dashboard/dashboardTables";
import { DataTable } from "../../components/admin/dashboard/data-table";
import { SectionCards } from "../../components/admin/dashboard/section-cards";

import data from "../../dummyData/data.json";

export default function Dashboard() {
  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <SectionCards />

          <div className="px-4 lg:px-6">
            <ChartAreaInteractive />
          </div>
          <DataTable data={data}  />

          <DashboardTables></DashboardTables>
        </div>
      </div>
    </div>
  );
}
