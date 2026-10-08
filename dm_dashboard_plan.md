# DM Executive Summary Dashboard — Plan

The **Executive Summary** (`/dm/dashboard`) serves as the landing page for a District Manager (DM). Since a DM only has access to their specific district's data, this page must filter and display information strictly scoped to their assigned stations and operations.

Based on the EOD (End of Day) Operations context, here is the proposed layout and content for the DM Executive Summary.

## 1. Top Section: Personalized Welcome & Status
- **Welcome Message:** "Welcome back, [DM Name] (District ID: [DMID])"
- **Overall Status Indicator:** A quick visual cue (e.g., Green/Yellow/Red badge) showing the health of their district today (e.g., "All 15 stations reported successfully" or "3 stations missing EOD data").
- **Date/Time Picker (Optional):** Contextual date range, defaulting to "Today" or the latest closed business day.

## 2. Key Performance Indicators (KPI Cards)
Four high-level summary cards at the top for a quick glance:
1. **Total Stations Managed:** The total active stations assigned to this DM.
2. **Today's EOD Submissions:** E.g., `12 / 15 (80%)` to show compliance for the current day.
3. **Open Anomalies / Alerts:** Count of unresolved issues (e.g., cash discrepancies, missing inventory logs). Clicking this links to the Anomalies Center.
4. **Monthly Compliance Score:** A percentage showing how well the district is performing over the current month (e.g., `94%`).

## 3. Data Visualizations
- **7-Day Compliance Trend (Bar/Line Chart):** A chart showing submission rates or anomaly counts over the past week for this DM's stations. This helps spot if a particular day had widespread issues.
- **(Optional) Station Performance Chart:** A brief breakdown (e.g., pie chart) of station statuses (e.g., On Time, Late, Missing).

## 4. Actionable Lists & Tables
- **Recent Anomalies (Priority Action Items):** A mini-table listing the top 3-5 critical alerts that require the DM's immediate attention (e.g., "Station 42 - Cash Shortage"). Includes a "Resolve" or "View Details" button.
- **Pending/Missing Stations:** A quick list of stations that have not yet submitted their EOD logs for the day.

## 5. Quick Actions Panel
A sidebar or row of prominent buttons for common tasks:
- ⬆️ **Upload New EOD Data** (Route to upload page)
- 📊 **View Full Daily Log** (Route to `/dm/dashboard/daily`)
- 📥 **Download District Summary (PDF/Excel)**

---

## 🛠 Technical Implementation Plan

1. **Frontend (`Overview.tsx`):**
   - Use `useAuthStore` to pull the `user.name` and `user.dmid` for the welcome header.
   - Use `recharts` for the 7-day trend chart.
   - Use Tailwind CSS grid layouts (e.g., `grid-cols-4` for KPIs, `grid-cols-3` for charts/lists).
   - Mock the API data locally first (using TanStack Query `useQuery` with a mock function) so we can build the UI immediately while the backend is being prepped.

2. **Backend (Future Step):**
   - Build a `GET /api/dm/summary` endpoint that uses the authenticated DM's token to query the database, calculate the KPIs, and return the aggregated data for the charts.

---

### What do you think of this layout? 
If this looks good, we can start by scaffolding the `Overview.tsx` page with this structure and some mock data to visualize it!

