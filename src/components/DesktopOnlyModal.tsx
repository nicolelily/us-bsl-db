import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';

type Props = {
  title?: string;
  description?: React.ReactNode;
  children: React.ReactNode; // trigger element (asChild)
};

const DesktopOnlyModal: React.FC<Props> = ({ title = 'Desktop only', description, children }) => {
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        {children}
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40" />
        <Dialog.Content className="fixed inset-x-4 top-1/4 mx-auto max-w-lg rounded-lg bg-white p-4 shadow-lg ring-1 ring-black/5">
          <div className="flex items-start justify-between">
            <div>
              <Dialog.Title asChild>
                <h3 className="text-lg font-semibold text-bsl-brown">{title}</h3>
              </Dialog.Title>
              {description && (
                <Dialog.Description asChild>
                  <p className="mt-2 text-sm text-bsl-brown">{description}</p>
                </Dialog.Description>
              )}
            </div>
            <div className="ml-4">
              <Dialog.Close asChild>
                <button aria-label="Close" className="p-2 rounded-md text-bsl-brown focus-visible:ring-2 focus-visible:ring-bsl-teal">
                  <X className="w-4 h-4" />
                </button>
              </Dialog.Close>
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <Dialog.Close asChild>
              <button className="px-4 py-2 rounded-md bg-bsl-teal text-white">Close</button>
            </Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default DesktopOnlyModal;
