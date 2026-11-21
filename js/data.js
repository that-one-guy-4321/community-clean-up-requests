const KEY = "community-cleanup-demo-v1";

const startingRecords = [
  {
    id: 1,
    title: "Overflowing bin near the playground",
    category: "Waste",
    description: "The public rubbish bin beside the playground is full and rubbish is falling onto the ground.",
    status: "Pending"
  },
  {
    id: 2,
    title: "Illegal dumping beside the footpath",
    category: "Waste",
    description: "Several bags and cardboard boxes have been left beside the footpath near the bus stop.",
    status: "In progress"
  },
  {
    id: 3,
    title: "Blocked drain outside the library",
    category: "Drainage",
    description: "Leaves and litter are blocking the drain outside the community library entrance.",
    status: "Pending"
  },
  {
    id: 4,
    title: "Litter around the bus stop",
    category: "Public space",
    description: "Plastic wrappers and bottles have collected around the benches at the main bus stop.",
    status: "Completed"
  },
  {
    id: 5,
    title: "Water pooling near the market entrance",
    category: "Drainage",
    description: "Water remains pooled near the market entrance after rain and may be caused by a blocked drain.",
    status: "Pending"
  },
  {
    id: 6,
    title: "Broken rubbish bin in the park",
    category: "Waste",
    description: "The lid of the rubbish bin beside the park entrance is broken and waste is spilling out.",
    status: "In progress"
  },
  {
    id: 7,
    title: "Litter along the walking path",
    category: "Public space",
    description: "There is litter along the walking path between the clinic and the community hall.",
    status: "Pending"
  },
  {
    id: 8,
    title: "Leaves blocking the storm drain",
    category: "Drainage",
    description: "A pile of leaves is covering the storm drain at the corner of Oak Street and Main Road.",
    status: "Completed"
  }
];

function readRecords() {
  return JSON.parse(localStorage.getItem(KEY));
}

function saveRecords(records) {
  localStorage.setItem(KEY, JSON.stringify(records));
}

// Add starting records only when this browser has no saved value for this key.
// If the saved value is [], it stays empty after a refresh.
if (localStorage.getItem(KEY) === null) {
  saveRecords(startingRecords);
}

export const recordService = {
  async list() {
    return readRecords();
  },

  async get(id) {
    const record = readRecords().find((item) => item.id === Number(id));

    if (!record) {
      throw new Error("That request could not be found.");
    }

    return record;
  },

  async create(record) {
    const records = readRecords();
    const nextId = records.reduce((highest, item) => {
      return Math.max(highest, item.id);
    }, 0) + 1;

    const newRecord = {
      id: nextId,
      title: record.title,
      category: record.category,
      description: record.description,
      status: record.status
    };

    records.push(newRecord);
    saveRecords(records);
    return newRecord;
  },

  async update(id, record) {
    const records = readRecords();
    const index = records.findIndex((item) => item.id === Number(id));

    if (index === -1) {
      throw new Error("That request could not be found.");
    }

    records[index] = {
      ...records[index],
      title: record.title,
      category: record.category,
      description: record.description,
      status: record.status
    };

    saveRecords(records);
    return records[index];
  },

  async remove(id) {
    const records = readRecords();
    const remaining = records.filter((item) => item.id !== Number(id));

    if (remaining.length === records.length) {
      throw new Error("That request could not be found.");
    }

    saveRecords(remaining);
    return { success: true, message: "Request deleted." };
  }
};