export type Lead = {
  id: string;
  firstName: string;
  lastName: string;
  phone?: string;
  email?: string;
  hasClinic: boolean;
  usersCount: number;
  source?: string;
  createdAt: string;
};

const KEY = "plicometria_marketing_leads_v1";

function getLeads(): Lead[] {
  try {
    const raw = typeof window !== "undefined" ? localStorage.getItem(KEY) : null;
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function saveLead(lead: Lead) {
  try {
    const arr = getLeads();
    arr.push(lead);
    localStorage.setItem(KEY, JSON.stringify(arr));
    // notify other windows/components
    window.dispatchEvent(new Event("storage"));
  } catch (e) {
    console.warn("Failed saving lead", e);
  }
}

function clearLeads() {
  try {
    localStorage.removeItem(KEY);
    window.dispatchEvent(new Event("storage"));
  } catch (e) {
    // ignore
  }
}

export default {
  getLeads,
  saveLead,
  clearLeads,
};
