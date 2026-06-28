# Ports

## 目的
- 定義 application 依賴的抽象能力。

## 圖解
- Repository ports：Employee、Attendance、Leave、Payroll、Approval、AuditLog。
- Service ports：AuthContext、Clock、FileStorage、Notification。

## 規則
- Port 以能力命名，不以實作技術命名。
- Port 介面穩定後，adapter 才能實作。

## 範例
- `PayrollRepository` 是 port；Firestore 版實作屬於 infrastructure。

## 維護注意事項
- 新增 Firebase 功能時，先檢查是否已有可重用 port。
