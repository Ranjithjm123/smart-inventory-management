
import {
  AlertTriangle,
  BarChart3,
  Check,
  ChevronLeft,
  ChevronRight,
  Clipboard,
  ClipboardCheck,
  CreditCard,
  DollarSign,
  Edit,
  Eye,
  FileText,
  Home,
  Info,
  Laptop,
  Loader2,
  Lock,
  LogOut,
  LucideProps,
  Package,
  PieChart,
  Plus,
  RefreshCw,
  Search,
  Settings,
  ShoppingCart,
  Store,
  Trash,
  User,
  Users,
  X,
  AlertCircle,
  LineChart,
  LayoutDashboard,
  History,
  ShoppingBag,
  Boxes,
  Bell,
  Tag,
  Calendar,
  Minus
} from "lucide-react";

export type Icon = React.ComponentType<React.SVGProps<SVGSVGElement>>;

export const Icons = {
  logo: Store,
  close: X,
  spinner: Loader2,
  chevronLeft: ChevronLeft,
  chevronRight: ChevronRight,
  trash: Trash,
  user: User,
  users: Users,
  add: Plus,
  warning: AlertTriangle,
  dashboard: LayoutDashboard,
  cart: ShoppingCart,
  bag: ShoppingBag,
  settings: Settings,
  logout: LogOut,
  inventory: Package,
  products: Boxes,
  sales: DollarSign,
  reports: FileText,
  barChart: BarChart3,
  pieChart: PieChart,
  lineChart: LineChart,
  edit: Edit,
  check: Check,
  alert: AlertCircle,
  search: Search,
  info: Info,
  payment: CreditCard,
  bell: Bell,
  history: History,
  refresh: RefreshCw,
  tag: Tag,
  home: Home,
  laptop: Laptop,
  lock: Lock,
  clipboard: Clipboard,
  clipboardCheck: ClipboardCheck,
  eye: Eye,
  dollarSign: DollarSign,
  package: Package,
  alertTriangle: AlertTriangle,
  creditCard: CreditCard,
  fileText: FileText,
  x: X,
  calendar: Calendar,
  minus: Minus,
  google: ({ ...props }: LucideProps) => (
    <svg
      aria-hidden="true"
      focusable="false"
      data-prefix="fab"
      data-icon="google"
      role="img"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 488 512"
      {...props}
    >
      <path
        fill="currentColor"
        d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"
      ></path>
    </svg>
  ),
};
