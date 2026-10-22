// MOCK implementation for Supabase client in AI Studio preview environment
// Uses browser storage / memory stub to provide graceful offline support

class SupabaseQueryMock {
  private tableName: string;

  constructor(tableName: string) {
    this.tableName = tableName;
  }

  select(_columns = '*') {
    return this;
  }

  async order(_column: string, _options?: { ascending?: boolean }) {
    try {
      const raw = localStorage.getItem(`mock_sb_${this.tableName}`);
      const data = raw ? JSON.parse(raw) : [];
      return { data, error: null };
    } catch {
      return { data: [], error: null };
    }
  }

  async upsert(record: any, _options?: any) {
    try {
      const raw = localStorage.getItem(`mock_sb_${this.tableName}`);
      let list = raw ? JSON.parse(raw) : [];
      const key = record.key;
      if (key) {
        list = list.filter((item: any) => item.key !== key);
      }
      list.unshift({ ...record, created_at: new Date().toISOString() });
      localStorage.setItem(`mock_sb_${this.tableName}`, JSON.stringify(list));
      return { data: record, error: null };
    } catch {
      return { data: record, error: null };
    }
  }

  delete() {
    return {
      eq: async (column: string, value: any) => {
        try {
          const raw = localStorage.getItem(`mock_sb_${this.tableName}`);
          let list = raw ? JSON.parse(raw) : [];
          list = list.filter((item: any) => item[column] !== value);
          localStorage.setItem(`mock_sb_${this.tableName}`, JSON.stringify(list));
          return { data: null, error: null };
        } catch {
          return { data: null, error: null };
        }
      },
      neq: async (column: string, value: any) => {
        try {
          const raw = localStorage.getItem(`mock_sb_${this.tableName}`);
          let list = raw ? JSON.parse(raw) : [];
          list = list.filter((item: any) => item[column] === value);
          localStorage.setItem(`mock_sb_${this.tableName}`, JSON.stringify(list));
          return { data: null, error: null };
        } catch {
          return { data: null, error: null };
        }
      },
    };
  }
}

export const supabase = {
  from(tableName: string) {
    return new SupabaseQueryMock(tableName);
  },
  auth: {
    getUser: async () => ({ data: { user: null }, error: null }),
    signOut: async () => ({ error: null }),
  },
};
