import React from "react";
import { FaUserPlus } from "react-icons/fa";

export default function PurchaseSidebar({
  navLinks,
  selectedOption,
  role,
  onSelectLink,
  onAddUser,
  onEditPassword,
  currentUsername,
}) {
  const normalizedCurrentUsername = String(currentUsername || "")
    .trim()
    .toLowerCase();
  const isDeveloperUser =
    normalizedCurrentUsername === "minmoy" ||
    normalizedCurrentUsername === "mrinmoy";

  return (
    <aside className="purchase-sidebar hidden lg:flex lg:w-64 text-black p-6 lg:fixed lg:left-0 lg:top-[102px] lg:h-[calc(100vh-102px)] flex-col">

      <div className="flex-1 overflow-y-auto">
        {Object.entries(navLinks).map(([section, links]) => (
          <div key={section} className="mb-8">
            <h2 className="text-lg font-bold mb-4">{section}</h2>

            <ul className="space-y-4">
              {links.length > 0 ? (
                links.map((link) => {
                  const isSelected = selectedOption === link.name;
                  return (
                    <li
                      key={link.name}
                      onClick={() => onSelectLink(link.name)}
                      className={`
                        flex items-center gap-3 p-3 rounded-xl cursor-pointer transition shadow-sm
                        bg-gray-100 hover:bg-red-100
                        ${
                          isSelected
                            ? "bg-red-100 border-l-4 border-red-500 text-red-700"
                            : ""
                        }
                      `}
                    >
                      <span className="text-xl">{link.icon}</span>
                      <span className="font-medium">{link.name}</span>
                    </li>
                  );
                })
              ) : (
                <li className="text-gray-500 italic">No links</li>
              )}
            </ul>
          </div>
        ))}

        {role === "ADMIN" && (
          <div className="mt-8">
            <button
              onClick={onAddUser}
              className="
                w-full flex items-center justify-center gap-3
                p-3 rounded-xl font-semibold
                bg-red-600 text-white
                hover:bg-red-700 transition shadow-md
              "
            >
              <FaUserPlus className="text-lg" />
              Add User
            </button>
          </div>
        )}

        {isDeveloperUser && (
          <div className="mt-3">
            <button
              onClick={onEditPassword}
              className="
                w-full flex items-center justify-center gap-3
                p-3 rounded-xl font-semibold
                bg-gray-900 text-white
                hover:bg-black transition shadow-md
              "
            >
              Edit Password
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
