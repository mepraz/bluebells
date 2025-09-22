import ReportToolForm from '@/components/report-tool-form';
import { FlaskConical } from 'lucide-react';

export default function ReportToolPage() {
  return (
    <div className="bg-background">
      <div className="container py-16">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-block rounded-lg bg-primary/10 p-3 mb-4">
                <FlaskConical className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">AI Water Quality Analysis</h1>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
              Provide details about your water source, and our AI will generate a quality report and recommend the best AquaSwift purifier for you.
            </p>
          </div>
          <ReportToolForm />
        </div>
      </div>
    </div>
  );
}
