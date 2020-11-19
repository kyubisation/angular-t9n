const pad = (value: number) => value.toString().padStart(2, '0');

export function timestamp() {
  const now = new Date();
  const date = [now.getFullYear(), now.getMonth() + 1, now.getDate()].map(pad).join('-');
  const time = [now.getHours(), now.getMinutes(), now.getSeconds()].map(pad).join(':');
  return `${date} ${time}`;
}
