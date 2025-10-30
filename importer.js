import { parseCsvFileToObjects } from './csvParser.js';
import { migrate, insertUser, getAgeDistribution } from './db.js';

function ensureRequiredAndCoerce(record) {
  const firstName = record?.name?.firstName ?? '';
  const lastName = record?.name?.lastName ?? '';
  const ageStr = record?.age ?? '';
  const age = Number(ageStr);
  if (!firstName || !lastName || !Number.isFinite(age)) {
    return { ok: false };
  }
  return {
    ok: true,
    name: `${firstName} ${lastName}`.trim(),
    age,
  };
}

function splitAddressAndAdditional(record) {
  const address = record.address && typeof record.address === 'object' ? record.address : undefined;
  // Remove known keys to derive additional_info
  const clone = JSON.parse(JSON.stringify(record));
  if (clone.name) delete clone.name; // keep original nested name
  delete clone.age;
  delete clone.address;
  return { address, additionalInfo: Object.keys(clone).length ? clone : undefined };
}

export async function importCsvAndUpload(csvAbsolutePath) {
  await migrate();
  const rows = parseCsvFileToObjects(csvAbsolutePath);
  let numImported = 0;
  let numSkipped = 0;
  for (const rec of rows) {
    const req = ensureRequiredAndCoerce(rec);
    if (!req.ok) {
      numSkipped += 1;
      continue;
    }
    const { address, additionalInfo } = splitAddressAndAdditional(rec);
    await insertUser({ name: req.name, age: req.age, address, additionalInfo });
    numImported += 1;
  }

  const distribution = await getAgeDistribution();
  // Print simple report on console
  console.log('Age-Group % Distribution');
  console.table(distribution);

  return { numImported, numSkipped };
}


