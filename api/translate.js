// OKOSO「前進の翻訳」用のサーバーレス・プロキシ（Vercel）

// ブラウザからは /api/translate を呼ぶ。APIキーはサーバー側の環境変数 ANTHROPIC_API_KEY に置く。

// これによりキーがブラウザに露出せず、CORSの問題も起きない。

export default async function handler(req, res) {

  // POSTのみ受け付ける

  if (req.method !== 'POST') {

    res.status(405).json({ error: 'Method not allowed' });

    return;

  }

  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {

    // キー未設定でも、アプリ側はフォールバック翻訳に切り替わるので500を返すだけでよい

    res.status(500).json({ error: 'ANTHROPIC_API_KEY is not set' });

    return;

  }

  try {

    // リクエストボディの取得（Vercelは自動でJSONをパースするが、念のため両対応）

    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});

    const system = body.system || '';

    const user = body.user || '';

    if (!user) {

      res.status(400).json({ error: 'user message is required' });

      return;

    }

    const r = await fetch('https://api.anthropic.com/v1/messages', {

      method: 'POST',

      headers: {

        'Content-Type': 'application/json',

        'x-api-key': apiKey,

        'anthropic-version': '2023-06-01'

      },

      body: JSON.stringify({

        model: 'claude-sonnet-4-6',

        max_tokens: 1000,

        system,

        messages: [{ role: 'user', content: user }]

      })

    });

    if (!r.ok) {

      const errText = await r.text();

      res.status(r.status).json({ error: 'anthropic_error', detail: errText });

      return;

    }

    const data = await r.json();

    // content配列をそのまま返す（アプリ側がtextブロックを抽出する）

    res.status(200).json({ content: data.content || [] });

  } catch (e) {

    res.status(500).json({ error: 'proxy_failed', detail: String(e) });

  }

}

