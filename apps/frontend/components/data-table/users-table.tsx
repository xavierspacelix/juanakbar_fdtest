"use client";
import * as React from "react";
import type { ColumnDef } from "@tanstack/react-table";
import {
  ArrowUpDown,
  MoreHorizontal,
  CheckCircle,
  XCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DataTable } from "./data-table";
import { getUserInitials } from "@/lib/utils";
import { getUsers } from "@/services/user.service";

export interface User {
  id: number;
  name: string;
  email: string;
  emailVerified: boolean;
  createdAt: string;
  avatar?: string;
}

const columns: ColumnDef<User>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="h-auto p-0 font-semibold"
      >
        Name
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const user = row.original;
      const initials = getUserInitials(user.name);
      return (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
            <AvatarFallback className="text-xs font-semibold text-white">{initials}</AvatarFallback>
          </Avatar>
          <div className="font-medium">{user.name}</div>
        </div>
      );
    },
  },
  {
    accessorKey: "email",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="h-auto p-0 font-semibold"
      >
        Email
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <div className="font-mono text-sm">{row.getValue("email")}</div>,
  },
  {
    accessorKey: "emailVerified",
    header: "Email Status",
    cell: ({ row }) => {
      const isVerified = row.getValue("emailVerified") as boolean;
      return (
        <div className="flex items-center gap-2">
          {isVerified ? (
            <>
              <CheckCircle className="h-4 w-4 text-green-600" />
              <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                Verified
              </Badge>
            </>
          ) : (
            <>
              <XCircle className="h-4 w-4 text-red-600" />
              <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300">
                Unverified
              </Badge>
            </>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="h-auto p-0 font-semibold"
      >
        Joined
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const date = new Date(row.getValue("createdAt"));
      return <div className="text-sm">{date.toLocaleDateString()}</div>;
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const user = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(user.email)}>
              Copy email
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

export function UsersTable() {
  const [users, setUsers] = React.useState<User[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
    pageCount: 0,
    total: 0,
  });
  const [filters, setFilters] = React.useState<Record<string, string>>({});
  const [search, setSearch] = React.useState("");

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await getUsers({
        search,
        isVerified: filters.isVerified,
        page: pagination.pageIndex + 1,
        limit: pagination.pageSize,
      });

      setUsers(res.data.users);
      setPagination((prev) => ({
        ...prev,
        pageCount: res.data.pageCount,
        total: res.data.total,
      }));
    } catch (err) {
      console.error("Failed to fetch users:", err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchUsers();
  }, [search, filters, pagination.pageIndex, pagination.pageSize]);

  return (
    <div className="w-full">
      <h1 className="text-3xl font-bold mb-2">Users Management</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        Manage user accounts, verify emails, and control access permissions.
      </p>

      <DataTable
        columns={columns}
        data={users}
        searchKey="name"
        searchPlaceholder="Search users by name or email..."
        filterOptions={[
          {
            key: "isVerified",
            label: "Email Status",
            options: [
              { label: "Verified", value: "true" },
              { label: "Unverified", value: "false" },
            ],
          }
        ]}
        onSearchChange={setSearch}
        onFilterChange={setFilters}
        pagination={{
          ...pagination,
          onPageChange: (page) => setPagination((p) => ({ ...p, pageIndex: page })),
          onPageSizeChange: (size) =>
            setPagination((p) => ({ ...p, pageSize: size, pageIndex: 0 })),
        }}
        loading={loading}
      />
    </div>
  );
}
