export type KidName = "Mira" | "Yazan";
export type DayName =
  | "Sunday"
  | "Monday"
  | "Tuesday"
  | "Wednesday"
  | "Thursday"
  | "Friday"
  | "Saturday";

export type PeriodKey = "morning" | "afterSchool" | "beforeSleep";

export type RoutineTask = {
  id: string;
  name: string;
  done: boolean;
};

export type Period = {
  key: PeriodKey;
  name: string;
  tasks: {
    kids: Partial<Record<KidName, RoutineTask[]>>;
  };
};

export type RoutinesData = {
  days: Array<{
    name: DayName;
    periods: Period[];
  }>;
};

export const PERIOD_LABELS: Record<PeriodKey, string> = {
  morning: "Morning",
  afterSchool: "After School",
  beforeSleep: "Before Sleep",
};

export const KIDS: KidName[] = ["Mira", "Yazan"];

type LegacyPeriod = {
  name: string;
  tasks: Record<KidName, RoutineTask[]>;
};

type LegacyRoutinesData = {
  days: Partial<Record<DayName, Partial<Record<PeriodKey, LegacyPeriod>>>>;
};

const routinesDataLegacy: LegacyRoutinesData = {
  days: {
    Sunday: {
      morning: {
        name: "Morning",
        tasks: {
          Mira: [
            { id: "m-m-1", name: "Make up bed", done: false },
            { id: "m-m-2", name: "Drink milk", done: false },
            { id: "m-m-3", name: "Prepare school bag", done: false },
            { id: "m-m-4", name: "Wear socks", done: false },
            { id: "m-m-5", name: "Put water bottle in bag", done: false },
            { id: "m-m-6", name: "Put lunch box in backpack", done: false },
          ],
          Yazan: [
            { id: "y-m-1", name: "Make up bed", done: false },
            { id: "y-m-2", name: "Drink milk", done: false },
            { id: "y-m-3", name: "Prepare school bag", done: false },
            { id: "y-m-4", name: "Wear socks", done: false },
            { id: "y-m-5", name: "Put water bottle in bag", done: false },
            { id: "y-m-6", name: "Put lunch box in backpack", done: false },
          ],
        },
      },
      afterSchool: {
        name: "After School",
        tasks: {
          Mira: [
            { id: "m-a-1", name: "Wash feet", done: false },
            { id: "m-a-2", name: "Throw socks in washing basket", done: false },
            {
              id: "m-a-3",
              name: "Throw dirty clothes in washing basket",
              done: false,
            },
            { id: "m-a-4", name: "Eat lunch or leftovers", done: false },
            { id: "m-a-5", name: "Rest for a bit", done: false },
          ],
          Yazan: [
            { id: "y-a-1", name: "Wash feet", done: false },
            { id: "y-a-2", name: "Throw socks in washing basket", done: false },
            {
              id: "y-a-3",
              name: "Throw dirty clothes in washing basket",
              done: false,
            },
            { id: "y-a-4", name: "Eat lunch or leftovers", done: false },
            { id: "y-a-5", name: "Rest for a bit", done: false },
          ],
        },
      },
      beforeSleep: {
        name: "Before Sleep",
        tasks: {
          Mira: [
            { id: "m-b-1", name: "Brush teeth", done: false },
            { id: "m-b-2", name: "Go to the toilet", done: false },
            {
              id: "m-b-3",
              name: "Prepare backpack for tomorrow",
              done: false,
            },
            { id: "m-b-4", name: "Finish homework", done: false },
            { id: "m-b-5", name: "Put toys/books back in place", done: false },
          ],
          Yazan: [
            { id: "y-b-1", name: "Brush teeth", done: false },
            { id: "y-b-2", name: "Go to the toilet", done: false },
            {
              id: "y-b-3",
              name: "Prepare backpack for tomorrow",
              done: false,
            },
            { id: "y-b-4", name: "Finish homework", done: false },
            { id: "y-b-5", name: "Put toys/books back in place", done: false },
          ],
        },
      },
    },
    Monday: {
      morning: {
        name: "Morning",
        tasks: {
          Mira: [
            { id: "m-m-1", name: "Make up bed", done: false },
            { id: "m-m-2", name: "Drink milk", done: false },
            { id: "m-m-3", name: "Prepare school bag", done: false },
            { id: "m-m-4", name: "Wear socks", done: false },
            { id: "m-m-5", name: "Put water bottle in bag", done: false },
            { id: "m-m-6", name: "Put lunch box in backpack", done: false },
          ],
          Yazan: [
            { id: "y-m-1", name: "Make up bed", done: false },
            { id: "y-m-2", name: "Drink milk", done: false },
            { id: "y-m-3", name: "Prepare school bag", done: false },
            { id: "y-m-4", name: "Wear socks", done: false },
            { id: "y-m-5", name: "Put water bottle in bag", done: false },
            { id: "y-m-6", name: "Put lunch box in backpack", done: false },
          ],
        },
      },
      afterSchool: {
        name: "After School",
        tasks: {
          Mira: [
            { id: "m-a-1", name: "Wash feet", done: false },
            { id: "m-a-2", name: "Throw socks in washing basket", done: false },
            {
              id: "m-a-3",
              name: "Throw dirty clothes in washing basket",
              done: false,
            },
            { id: "m-a-4", name: "Eat lunch or leftovers", done: false },
            { id: "m-a-5", name: "Rest for a bit", done: false },
          ],
          Yazan: [
            { id: "y-a-1", name: "Wash feet", done: false },
            { id: "y-a-2", name: "Throw socks in washing basket", done: false },
            {
              id: "y-a-3",
              name: "Throw dirty clothes in washing basket",
              done: false,
            },
            { id: "y-a-4", name: "Eat lunch or leftovers", done: false },
            { id: "y-a-5", name: "Rest for a bit", done: false },
          ],
        },
      },
      beforeSleep: {
        name: "Before Sleep",
        tasks: {
          Mira: [
            { id: "m-b-1", name: "Brush teeth", done: false },
            { id: "m-b-2", name: "Go to the toilet", done: false },
            {
              id: "m-b-3",
              name: "Prepare backpack for tomorrow",
              done: false,
            },
            { id: "m-b-4", name: "Finish homework", done: false },
            { id: "m-b-5", name: "Put toys/books back in place", done: false },
          ],
          Yazan: [
            { id: "y-b-1", name: "Brush teeth", done: false },
            { id: "y-b-2", name: "Go to the toilet", done: false },
            {
              id: "y-b-3",
              name: "Prepare backpack for tomorrow",
              done: false,
            },
            { id: "y-b-4", name: "Finish homework", done: false },
            { id: "y-b-5", name: "Put toys/books back in place", done: false },
          ],
        },
      },
    },
    Tuesday: {
      morning: {
        name: "Morning",
        tasks: {
          Mira: [
            { id: "m-m-1", name: "Make up bed", done: false },
            { id: "m-m-2", name: "Drink milk", done: false },
            { id: "m-m-3", name: "Prepare school bag", done: false },
            { id: "m-m-4", name: "Wear socks", done: false },
            { id: "m-m-5", name: "Put water bottle in bag", done: false },
            { id: "m-m-6", name: "Put lunch box in backpack", done: false },
          ],
          Yazan: [
            { id: "y-m-1", name: "Make up bed", done: false },
            { id: "y-m-2", name: "Drink milk", done: false },
            { id: "y-m-3", name: "Prepare school bag", done: false },
            { id: "y-m-4", name: "Wear socks", done: false },
            { id: "y-m-5", name: "Put water bottle in bag", done: false },
            { id: "y-m-6", name: "Put lunch box in backpack", done: false },
          ],
        },
      },
      afterSchool: {
        name: "After School",
        tasks: {
          Mira: [
            { id: "m-a-1", name: "Wash feet", done: false },
            { id: "m-a-2", name: "Throw socks in washing basket", done: false },
            {
              id: "m-a-3",
              name: "Throw dirty clothes in washing basket",
              done: false,
            },
            { id: "m-a-4", name: "Eat lunch or leftovers", done: false },
            { id: "m-a-5", name: "Rest for a bit", done: false },
          ],
          Yazan: [
            { id: "y-a-1", name: "Wash feet", done: false },
            { id: "y-a-2", name: "Throw socks in washing basket", done: false },
            {
              id: "y-a-3",
              name: "Throw dirty clothes in washing basket",
              done: false,
            },
            { id: "y-a-4", name: "Eat lunch or leftovers", done: false },
            { id: "y-a-5", name: "Rest for a bit", done: false },
          ],
        },
      },
      beforeSleep: {
        name: "Before Sleep",
        tasks: {
          Mira: [
            { id: "m-b-1", name: "Brush teeth", done: false },
            { id: "m-b-2", name: "Go to the toilet", done: false },
            {
              id: "m-b-3",
              name: "Prepare backpack for tomorrow",
              done: false,
            },
            { id: "m-b-4", name: "Finish homework", done: false },
            { id: "m-b-5", name: "Put toys/books back in place", done: false },
          ],
          Yazan: [
            { id: "y-b-1", name: "Brush teeth", done: false },
            { id: "y-b-2", name: "Go to the toilet", done: false },
            {
              id: "y-b-3",
              name: "Prepare backpack for tomorrow",
              done: false,
            },
            { id: "y-b-4", name: "Finish homework", done: false },
            { id: "y-b-5", name: "Put toys/books back in place", done: false },
          ],
        },
      },
    },
    Wednesday: {
      morning: {
        name: "Morning",
        tasks: {
          Mira: [
            { id: "m-m-1", name: "Make up bed", done: false },
            { id: "m-m-2", name: "Drink milk", done: false },
            { id: "m-m-3", name: "Prepare school bag", done: false },
            { id: "m-m-4", name: "Wear socks", done: false },
            { id: "m-m-5", name: "Put water bottle in bag", done: false },
            { id: "m-m-6", name: "Put lunch box in backpack", done: false },
          ],
          Yazan: [
            { id: "y-m-1", name: "Make up bed", done: false },
            { id: "y-m-2", name: "Drink milk", done: false },
            { id: "y-m-3", name: "Prepare school bag", done: false },
            { id: "y-m-4", name: "Wear socks", done: false },
            { id: "y-m-5", name: "Put water bottle in bag", done: false },
            { id: "y-m-6", name: "Put lunch box in backpack", done: false },
          ],
        },
      },
      afterSchool: {
        name: "After School",
        tasks: {
          Mira: [
            { id: "m-a-1", name: "Wash feet", done: false },
            { id: "m-a-2", name: "Throw socks in washing basket", done: false },
            {
              id: "m-a-3",
              name: "Throw dirty clothes in washing basket",
              done: false,
            },
            { id: "m-a-4", name: "Eat lunch or leftovers", done: false },
            { id: "m-a-5", name: "Rest for a bit", done: false },
          ],
          Yazan: [
            { id: "y-a-1", name: "Wash feet", done: false },
            { id: "y-a-2", name: "Throw socks in washing basket", done: false },
            {
              id: "y-a-3",
              name: "Throw dirty clothes in washing basket",
              done: false,
            },
            { id: "y-a-4", name: "Eat lunch or leftovers", done: false },
            { id: "y-a-5", name: "Rest for a bit", done: false },
          ],
        },
      },
      beforeSleep: {
        name: "Before Sleep",
        tasks: {
          Mira: [
            { id: "m-b-1", name: "Brush teeth", done: false },
            { id: "m-b-2", name: "Go to the toilet", done: false },
            {
              id: "m-b-3",
              name: "Prepare backpack for tomorrow",
              done: false,
            },
            { id: "m-b-4", name: "Finish homework", done: false },
            { id: "m-b-5", name: "Put toys/books back in place", done: false },
          ],
          Yazan: [
            { id: "y-b-1", name: "Brush teeth", done: false },
            { id: "y-b-2", name: "Go to the toilet", done: false },
            {
              id: "y-b-3",
              name: "Prepare backpack for tomorrow",
              done: false,
            },
            { id: "y-b-4", name: "Finish homework", done: false },
            { id: "y-b-5", name: "Put toys/books back in place", done: false },
          ],
        },
      },
    },
    Thursday: {
      morning: {
        name: "Morning",
        tasks: {
          Mira: [
            { id: "m-m-1", name: "Make up bed", done: false },
            { id: "m-m-2", name: "Drink milk", done: false },
            { id: "m-m-3", name: "Prepare school bag", done: false },
            { id: "m-m-4", name: "Wear socks", done: false },
            { id: "m-m-5", name: "Put water bottle in bag", done: false },
            { id: "m-m-6", name: "Put lunch box in backpack", done: false },
          ],
          Yazan: [
            { id: "y-m-1", name: "Make up bed", done: false },
            { id: "y-m-2", name: "Drink milk", done: false },
            { id: "y-m-3", name: "Prepare school bag", done: false },
            { id: "y-m-4", name: "Wear socks", done: false },
            { id: "y-m-5", name: "Put water bottle in bag", done: false },
            { id: "y-m-6", name: "Put lunch box in backpack", done: false },
          ],
        },
      },
      afterSchool: {
        name: "After School",
        tasks: {
          Mira: [
            { id: "m-a-1", name: "Wash feet", done: false },
            { id: "m-a-2", name: "Throw socks in washing basket", done: false },
            {
              id: "m-a-3",
              name: "Throw dirty clothes in washing basket",
              done: false,
            },
            { id: "m-a-4", name: "Eat lunch or leftovers", done: false },
            { id: "m-a-5", name: "Rest for a bit", done: false },
          ],
          Yazan: [
            { id: "y-a-1", name: "Wash feet", done: false },
            { id: "y-a-2", name: "Throw socks in washing basket", done: false },
            {
              id: "y-a-3",
              name: "Throw dirty clothes in washing basket",
              done: false,
            },
            { id: "y-a-4", name: "Eat lunch or leftovers", done: false },
            { id: "y-a-5", name: "Rest for a bit", done: false },
          ],
        },
      },
      beforeSleep: {
        name: "Before Sleep",
        tasks: {
          Mira: [
            { id: "m-b-1", name: "Brush teeth", done: false },
            { id: "m-b-2", name: "Go to the toilet", done: false },
            {
              id: "m-b-3",
              name: "Prepare backpack for tomorrow",
              done: false,
            },
            { id: "m-b-4", name: "Finish homework", done: false },
            { id: "m-b-5", name: "Put toys/books back in place", done: false },
          ],
          Yazan: [
            { id: "y-b-1", name: "Brush teeth", done: false },
            { id: "y-b-2", name: "Go to the toilet", done: false },
            {
              id: "y-b-3",
              name: "Prepare backpack for tomorrow",
              done: false,
            },
            { id: "y-b-4", name: "Finish homework", done: false },
            { id: "y-b-5", name: "Put toys/books back in place", done: false },
          ],
        },
      },
    },
  },
};

export const routinesData: RoutinesData = {
  days: Object.entries(routinesDataLegacy.days).map(([dayName, periodsMap]) => ({
    name: dayName as DayName,
    periods: Object.entries(periodsMap ?? {})
      .filter(([, p]) => Boolean(p))
      .map(([key, p]) => ({
        key: key as PeriodKey,
        name: (p as LegacyPeriod).name,
        tasks: { kids: (p as LegacyPeriod).tasks },
      })),
  })),
};


