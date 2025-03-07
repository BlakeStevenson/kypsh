import { NextRequest, NextResponse } from 'next/server';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';

// Initialize the database connection
async function openDb() {
  return open({
    filename: path.join(process.cwd(), 'database.sqlite'),
    driver: sqlite3.Database,
  });
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ shortCode: string }> }
) {
  try {
    const { shortCode } = await params;
    
    // Open database connection
    const db = await openDb();
    
    // Find the URL entry
    const urlEntry = await db.get('SELECT * FROM urls WHERE short_code = ?', [shortCode]);
    
    // If no entry found, return 404
    if (!urlEntry) {
      // This could redirect to a 404 page instead
      return NextResponse.json(
        { error: 'Short URL not found' },
        { status: 404 }
      );
    }
    
    // Increment the access count
    await db.run(
      'UPDATE urls SET access_count = access_count + 1 WHERE short_code = ?',
      [shortCode]
    );
    
    // Check if warning is needed
    if (urlEntry.warning_type || urlEntry.custom_warning) {
      // Redirect to warning page with parameters
      const warningUrl = new URL('/warning', request.url);
      warningUrl.searchParams.set('destination', urlEntry.original_url);
      
      if (urlEntry.warning_type) {
        warningUrl.searchParams.set('warningType', urlEntry.warning_type);
      }
      
      if (urlEntry.custom_warning) {
        warningUrl.searchParams.set('customWarning', urlEntry.custom_warning);
      }
      
      return NextResponse.redirect(warningUrl);
    }
    
    // No warning needed, redirect directly
    return NextResponse.redirect(urlEntry.original_url);
  } catch (error) {
    console.error('Error redirecting short URL:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}