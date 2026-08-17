<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

/**
 * One-off migration helper: copies every row from the sqlite connection to
 * the d1 connection, table by table, in FK-dependency order. Deliberately
 * not a generic dump/restore tool - every table is listed explicitly here
 * so the migration stays inspectable/diffable for real patient data, and
 * the row-count comparison at the end is the first line of defense before
 * the manual spot-check described in the migration plan.
 *
 * Unlike the Postgres version of this command, there's no sequence-reset
 * step needed after inserting explicit PK values: D1/SQLite's INTEGER
 * PRIMARY KEY autoincrement is derived from MAX(rowid) at insert time,
 * not tracked in a separate sequence object the way Postgres does it.
 *
 * cache/jobs/sessions/password_reset_tokens are deliberately excluded -
 * they're ephemeral runtime tables, not business data, and should start
 * empty on the new database.
 *
 * Run: php artisan db:sync-sqlite-to-d1 [--truncate]
 */
class SyncSqliteToD1 extends Command
{
    protected $signature = 'db:sync-sqlite-to-d1
        {--source=sqlite : Source connection name}
        {--target=d1 : Target connection name}
        {--truncate : Truncate each target table before inserting}
        {--chunk=500 : Rows per insert batch - tune down if D1 batch limits are hit}';

    protected $description = 'Copy all business data from the sqlite connection to the d1 connection, in FK-dependency order';

    /** Order matters: a table only appears after every table it references. */
    private const TABLES = [
        'clinics',
        'users',
        'appointments',
        'clinic_schedules',
        'clinic_booking_settings',
        'break_times',
        'holidays',
        'temporary_closures',
        'admin_activity_log',
    ];

    public function handle(): int
    {
        $source = $this->option('source');
        $target = $this->option('target');
        $chunkSize = (int) $this->option('chunk');

        $this->info("Syncing {$source} -> {$target}");

        foreach (self::TABLES as $table) {
            $sourceCount = DB::connection($source)->table($table)->count();

            if ($this->option('truncate')) {
                DB::connection($target)->table($table)->truncate();
            }

            $copied = 0;
            DB::connection($source)->table($table)->orderBy('id')->chunk($chunkSize, function ($rows) use ($target, $table, &$copied) {
                $batch = $rows->map(fn ($row) => (array) $row)->all();
                if ($batch !== []) {
                    DB::connection($target)->table($table)->insert($batch);
                    $copied += count($batch);
                }
            });

            $targetCount = DB::connection($target)->table($table)->count();
            $status = $targetCount === $sourceCount ? '<info>ok</info>' : '<error>MISMATCH</error>';
            $this->line(sprintf('%-28s source=%-6d copied=%-6d target=%-6d %s', $table, $sourceCount, $copied, $targetCount, $status));

            if ($targetCount !== $sourceCount) {
                $this->error("Row count mismatch on {$table} - stopping. Investigate before continuing.");
                return self::FAILURE;
            }
        }

        $this->info('Sync complete. Manually spot-check a handful of appointment records before cutover.');
        return self::SUCCESS;
    }
}
