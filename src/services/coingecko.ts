export async function fetchBtcPriceUSD(signal?: AbortSignal): Promise<number> {
  const url = 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd';
  const res = await fetch(url, { signal, headers: { 'accept': 'application/json' } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  const price = data?.bitcoin?.usd;
  if (typeof price !== 'number') throw new Error('Bad payload');
  return price;
}

