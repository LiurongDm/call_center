import { defineStore } from "pinia";

export const useTheme = defineStore('componentTheme',{
    state:()=>({
        theme: 'dark' as 'dark' | 'vintage',

    }),
    actions: {
        changeTheme(): void {
          console.log(this.theme)
          if (this.theme === 'dark') {
            this.theme = 'vintage';
          } else {
            this.theme = 'dark';
          }
        },
      },
    });