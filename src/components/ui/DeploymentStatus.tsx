import React, { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { getDeploymentStatus } from '../../lib/deploy';

interface DeploymentStatusProps {
  onDeployed?: (url: string) => void;
  onClaimed?: () => void;
}

export function DeploymentStatus({ onDeployed, onClaimed }: DeploymentStatusProps) {
  const [status, setStatus] = useState<'deploying' | 'deployed' | 'claimed' | 'error'>('deploying');
  const [deployUrl, setDeployUrl] = useState<string | null>(null);
  const [claimUrl, setClaimUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await getDeploymentStatus({});
        
        if (response.error) {
          setStatus('error');
          setError(response.error);
          return;
        }

        if (response.claimed) {
          setStatus('claimed');
          onClaimed?.();
          return;
        }

        if (response.ready) {
          setStatus('deployed');
          setDeployUrl(response.deploy_url);
          setClaimUrl(response.claim_url);
          onDeployed?.(response.deploy_url);
          return;
        }

        // Continue checking status
        setTimeout(checkStatus, 2000);
      } catch (err) {
        setStatus('error');
        setError('Failed to check deployment status');
      }
    };

    checkStatus();
  }, [onDeployed, onClaimed]);

  if (status === 'error') {
    return (
      <div className="text-red-600">
        {error || 'An error occurred during deployment'}
      </div>
    );
  }

  if (status === 'claimed') {
    return (
      <div className="text-green-600">
        Site has been claimed and a new deployment URL has been generated
      </div>
    );
  }

  if (status === 'deployed') {
    return (
      <div className="space-y-4">
        <div className="text-green-600">
          Site has been deployed successfully!
        </div>
        {deployUrl && (
          <div>
            <a
              href={deployUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-700 hover:underline"
            >
              View deployed site
            </a>
          </div>
        )}
        {claimUrl && (
          <div className="text-sm text-gray-600">
            <p>To transfer this site to your Netlify account:</p>
            <a
              href={claimUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-700 hover:underline"
            >
              Click here to claim this site
            </a>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-3 text-gray-600">
      <Loader2 className="w-5 h-5 animate-spin" />
      <span>Deploying your site...</span>
    </div>
  );
}