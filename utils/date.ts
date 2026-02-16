export const formatWIB = (timestamp: number): string => {
  // timestamp dalam detik (Unix), ubah ke milidetik dan tambah 7 jam
  const date = new Date((timestamp + 7 * 3600) * 1000);
  return date.toISOString().replace('T', ' ').substring(0, 19) + ' WIB';
};

// Alternatif dengan toLocaleString (menggunakan timeZone Asia/Jakarta)
export const formatWIBLocale = (timestamp: number): string => {
  return new Date(timestamp * 1000).toLocaleString('id-ID', {
    timeZone: 'Asia/Jakarta',
    dateStyle: 'medium',
    timeStyle: 'medium',
  }) + ' WIB';
};