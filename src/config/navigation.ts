import { BarChart3, Bell, Briefcase, Building2, ClipboardCheck, ClipboardList, CreditCard, FileText, LayoutDashboard, Send, ShieldCheck, Trophy, UserCircle, Users, Wallet } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { Role } from '@/types/api';

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export const publicNav = [
  { label: 'Assessments', href: '/assessments' },
  { label: 'Jobs', href: '/jobs' },
  { label: 'Companies', href: '/companies' },
  { label: 'Candidates', href: '/candidates' },
  { label: 'Rankings', href: '/rankings' },
];

const shared: NavItem[] = [{ label: 'Notifications', href: '/notifications', icon: Bell }];

export const dashboardNav: Record<Role, NavItem[]> = {
  SUPER_ADMIN: [
    { label: 'Overview', href: '/admin', icon: LayoutDashboard },
    { label: 'Company approvals', href: '/admin/companies', icon: Building2 },
    { label: 'Users', href: '/admin/users', icon: Users },
    { label: 'Assessments', href: '/admin/assessments', icon: ClipboardList },
    { label: 'Payments', href: '/admin/payments', icon: Wallet },
    { label: 'Reports', href: '/admin/reports', icon: BarChart3 },
    ...shared,
  ],
  COMPANY: [
    { label: 'Overview', href: '/company', icon: LayoutDashboard },
    { label: 'Assessments', href: '/company/assessments', icon: ClipboardList },
    { label: 'Evaluations', href: '/company/evaluations', icon: ClipboardCheck },
    { label: 'Jobs', href: '/company/jobs', icon: Briefcase },
    { label: 'Applications', href: '/company/applications', icon: FileText },
    { label: 'Team', href: '/company/employees', icon: Users },
    { label: 'Billing', href: '/payments', icon: CreditCard },
    ...shared,
  ],
  CANDIDATE: [
    { label: 'Overview', href: '/candidate', icon: LayoutDashboard },
    { label: 'My assessments', href: '/candidate/assessments', icon: ClipboardList },
    { label: 'Results', href: '/candidate/results', icon: Trophy },
    { label: 'Applications', href: '/candidate/applications', icon: Send },
    { label: 'Profile', href: '/candidate/profile', icon: UserCircle },
    { label: 'Payments', href: '/payments', icon: CreditCard },
    ...shared,
  ],
};

export const roleLabel: Record<Role, string> = { SUPER_ADMIN: 'Super Admin', COMPANY: 'Company', CANDIDATE: 'Candidate' };
export const roleIcon: Record<Role, LucideIcon> = { SUPER_ADMIN: ShieldCheck, COMPANY: Building2, CANDIDATE: UserCircle };
