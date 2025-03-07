import { NextRequest, NextResponse } from 'next/server';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { nanoid } from 'nanoid';

// Initialize the database connection
async function openDb() {
  const db = await open({
    filename: path.join(process.cwd(), 'database.sqlite'),
    driver: sqlite3.Database,
  });
  
  // Ensure the table exists
  await db.exec(`
    CREATE TABLE IF NOT EXISTS urls (
      short_code TEXT PRIMARY KEY,
      original_url TEXT NOT NULL,
      warning_type TEXT,
      custom_warning TEXT,
      created_at INTEGER NOT NULL,
      access_count INTEGER DEFAULT 0
    );
  `);
  
  return db;
}

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const body = await request.json();
    const { originalUrl, warningType, customWarning } = body;
    let shortCode = body.alias;

    // Validate required fields
    if (!originalUrl) {
      return NextResponse.json(
        { error: 'Original URL is required' },
        { status: 400 }
      );
    }

    // Generate a shortCode if none is provided
    if (!shortCode) {
      shortCode = nanoid(8);
    }

    // Open database connection
    const db = await openDb();

    // Check if the shortCode already exists
    const existing = await db.get('SELECT short_code FROM urls WHERE short_code = ?', [shortCode]);
    if (existing) {
      // If shortCode was provided by user, return error
      if (body.alias) {
        return NextResponse.json(
          { error: 'Alias already exists. Please try again.' },
          { status: 409 }
        );
      }
      // If we auto-generated it, try again with a new code
      shortCode = nanoid(8);
      const secondCheck = await db.get('SELECT short_code FROM urls WHERE short_code = ?', [shortCode]);
      if (secondCheck) {
        return NextResponse.json(
          { error: 'Failed to generate unique short code, please try again' },
          { status: 500 }
        );
      }
    }

    // Insert the new short URL
    const currentTime = Math.floor(Date.now() / 1000); // Unix timestamp in seconds
    await db.run(
      `INSERT INTO urls (
        short_code, 
        original_url, 
        warning_type, 
        custom_warning, 
        created_at, 
        access_count
      ) VALUES (?, ?, ?, ?, ?, ?)`,
      [shortCode, originalUrl, warningType || null, customWarning || null, currentTime, 0]
    );

    // Return success response
    return NextResponse.json({
      shortCode,
      originalUrl,
      warningType: warningType || null,
      customWarning: customWarning || null,
      createdAt: currentTime,
      accessCount: 0
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating short URL:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}