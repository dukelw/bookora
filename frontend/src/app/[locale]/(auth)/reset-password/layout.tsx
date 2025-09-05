import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Skill Nest | Reset Password",
  description: "Thay đổi thông tin đăng nhập vào nền tảng học tập Skill Nest",
};

export default function ResetPasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
