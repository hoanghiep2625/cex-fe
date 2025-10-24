"use client";

import { useState } from "react";
import CustomCheckbox from "./ui/CustomCheckbox";
import TabUnderline from "./ui/TabUnderline";

export default function UserOrderManagementPanel({
  pair,
  type,
}: {
  pair: string;
  type: string;
}) {
  const [hideOtherPairs, setHideOtherPairs] = useState(false);
  const [activeTab, setActiveTab] = useState("orders");

  const tabs = [
    { id: "orders", label: "Giao dịch đang chờ khớp lệnh" },
    { id: "history", label: "Lịch sử lệnh" },
    { id: "trades", label: "Lịch sử giao dịch" },
    { id: "balance", label: "Vốn" },
    { id: "bot", label: "Bot" },
  ];

  return (
    <div className="bg-[#181A20] rounded-[10px] min-h-[400px] mb-[30px] m-1">
      <div className="relative flex justify-between items-center p-4 pb-0 border-b border-gray-700">
        <ul className="text-gray-400 text-xs font-semibold flex gap-4">
          {tabs.map((tab) => (
            <li key={tab.id}>
              <TabUnderline
                className="text-xs font-semibold pb-3"
                active={activeTab === tab.id}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </TabUnderline>
            </li>
          ))}
        </ul>
        <div className="absolute text-white text-xs flex gap-2 right-4 top-[15px]">
          <CustomCheckbox
            checked={hideOtherPairs}
            onChange={setHideOtherPairs}
            label="Ẩn các cặp tỉ giá khác"
          />
        </div>
      </div>
      <div className="text-white bg-[#181A20] p-4 min-h-[300px]">
        {activeTab === "orders" && <div>Giao dịch đang chờ khớp lệnh</div>}
        {activeTab === "history" && <div>Lịch sử lệnh</div>}
        {activeTab === "trades" && <div>Lịch sử giao dịch</div>}
        {activeTab === "balance" && <div>Vốn</div>}
        {activeTab === "bot" && <div>Bot</div>}
      </div>
    </div>
  );
}
