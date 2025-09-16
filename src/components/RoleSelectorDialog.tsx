import * as React from 'react';

interface RoleSelectorDialogProps {
  roles: string[];
  activeRole: string | null;
  setActiveRole: (role: string) => void;
}

export const RoleSelectorDialog: React.FC<RoleSelectorDialogProps> = ({ roles, activeRole, setActiveRole }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded shadow-lg p-6 min-w-[300px]">
        <h2 className="text-lg font-bold mb-4">Select your role</h2>
        <select
          className="w-full mb-4 p-2 border rounded"
          onChange={e => setActiveRole(e.target.value)}
          defaultValue=""
        >
          <option value="" disabled>Select role...</option>
          {roles.map((role: string) => (
            <option key={role} value={role}>{role.replace('ROLE_', '')}</option>
          ))}
        </select>
        <button
          className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700"
          onClick={() => {
            if (!activeRole) return;
            // Just close dialog, UI will update
          }}
          disabled={!activeRole}
        >Continue</button>
      </div>
    </div>
  );
};
