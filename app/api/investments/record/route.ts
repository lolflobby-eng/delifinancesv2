// app/api/investments/record/route.ts - Next.js API route for Investment records

import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { InvestmentRecord } from '@/lib/models';

export async function GET(request: Request) {
    const { data, error } = await supabase.from<InvestmentRecord>('investment_records').select('*');
    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(data);
}

export async function POST(request: Request) {
    const body = await request.json();
    const record: Omit<InvestmentRecord, 'id'> = {
        date: body.date,
        amount: body.amount,
        source: body.source,
    };
    const { data, error } = await supabase.from('investment_records').insert(record).select();
    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json(data[0], { status: 201 });
}
