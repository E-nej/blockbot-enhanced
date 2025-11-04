import { useLeaderboard } from '../hooks/useLeaderboard';
import { FaStar } from 'react-icons/fa';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeadCell,
  TableRow,
} from 'flowbite-react';

export default function Leaderboards() {
  const { leaderboardRows, isLoadingRows, rowsError } = useLeaderboard();

  return (
    <div className="flex min-h-[calc(100vh-120px)] items-center justify-center p-8">
      <div
        className="relative mx-auto overflow-hidden rounded-[8rem] bg-[#0F2F2C]"
        style={{
          aspectRatio: '344/216',
          width: 'min(calc(100vw - 240px), calc((100vh - 240px) * 344/216))',
          height: 'min(calc(100vw - 240px) * 216/344, calc(100vh - 240px))',
          boxShadow: `
            0 0 0 8px #C2CED9,
            0 0 0 48px #EBEEF3
          `,
        }}
      >
        {/* Screen Content */}
        <div className="flex h-full w-full flex-col items-center justify-around p-16">
          {isLoadingRows ? (
            <div className="flex flex-col items-center gap-4">
              <div className="border-primary-500 h-16 w-16 animate-spin rounded-full border-b-2"></div>
            </div>
          ) : rowsError ? (
            <div className="flex flex-col items-center gap-4">
              <h1 className="text-center text-red-400">
                Napaka pri nalaganju lestvice
              </h1>
            </div>
          ) : leaderboardRows.length === 0 ? (
            <div className="flex flex-col items-center gap-4">
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHead>
                  <TableHeadCell className="bg-transparent text-xl text-white">
                    Mesto
                  </TableHeadCell>
                  <TableHeadCell className="bg-transparent text-xl text-white">
                    Uporabnik ID
                  </TableHeadCell>
                  <TableHeadCell className="bg-transparent text-xl text-white">
                    Skupno zvezdic
                  </TableHeadCell>
                </TableHead>
                <TableBody className="divide-y">
                  {leaderboardRows.map((row, index) => (
                    <TableRow
                      key={row.user_id}
                      className="border-gray-600 bg-transparent"
                    >
                      <TableCell className="text-xl font-medium whitespace-nowrap text-white">
                        {index + 1}
                      </TableCell>
                      <TableCell className="text-xl text-white">
                        {row.user_id}
                      </TableCell>
                      <TableCell>
                        <div className="text-primary-400 flex items-center gap-2 text-2xl font-bold">
                          <FaStar />
                          {row.total_stars}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
