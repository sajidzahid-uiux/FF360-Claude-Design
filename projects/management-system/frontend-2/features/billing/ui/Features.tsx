import { CheckCircle2 } from "lucide-react";

import { Card } from "@/shared/ui/primitives";

export default function Features() {
  return (
    <Card className="rounded-2xl p-6">
      <h2 className="text-text-primary mb-2 text-lg font-semibold">
        All plans include these features
      </h2>
      <p className="text-text-muted mb-8 text-sm">
        Every plan comes with our complete suite of business management tools
      </p>

      <div className="grid grid-cols-1 gap-x-8 gap-y-10 md:grid-cols-2">
        {/* Left Column */}
        <div className="space-y-8">
          {/* Job & Lead Management */}
          <div>
            <h3 className="text-text-primary mb-4 font-semibold">
              Job & Lead Management
            </h3>
            <ul className="space-y-2">
              <li className="flex">
                <CheckCircle2 className="text-accent mr-2 h-5 w-5 flex-shrink-0" />
                <span className="text-text-primary text-sm">
                  Manage and track all your leads and active jobs for tiling,
                  repair, and excavation
                </span>
              </li>
              <li className="flex">
                <CheckCircle2 className="text-accent mr-2 h-5 w-5 flex-shrink-0" />
                <span className="text-text-primary text-sm">
                  Fully customizable job and leads statuses - adapt them to
                  match your business strategy
                </span>
              </li>
              <li className="flex">
                <CheckCircle2 className="text-accent mr-2 h-5 w-5 flex-shrink-0" />
                <span className="text-text-primary text-sm">
                  Track machine usage per job to ensure accurate billing and
                  resource allocation
                </span>
              </li>
            </ul>
          </div>
          {/* Order & Supply Management */}
          <div>
            <h3 className="text-text-primary mb-4 font-semibold">
              Order & Supply Management
            </h3>
            <ul className="space-y-2">
              <li className="flex">
                <CheckCircle2 className="text-accent mr-2 h-5 w-5 flex-shrink-0" />
                <span className="text-text-primary text-sm">
                  Create and manage pipe orders for tiling jobs
                </span>
              </li>
              <li className="flex">
                <CheckCircle2 className="text-accent mr-2 h-5 w-5 flex-shrink-0" />
                <span className="text-text-primary text-sm">
                  (Coming Soon – Free This Year!) Send orders directly to your
                  pipe supplier, get confirmation, and track every step of the
                  order status
                </span>
              </li>
              <li className="flex">
                <CheckCircle2 className="text-accent mr-2 h-5 w-5 flex-shrink-0" />
                <span className="text-text-primary text-sm">
                  (Coming Soon – Free This Year!) Collaborate with the largest
                  tile design company to share jobs, track progress, and request
                  changes easily
                </span>
              </li>
            </ul>
          </div>
          {/* Dashboards & Analytics */}
          <div>
            <h3 className="text-text-primary mb-4 font-semibold">
              Dashboards & Analytics
            </h3>
            <ul className="space-y-2">
              <li className="flex">
                <CheckCircle2 className="text-accent mr-2 h-5 w-5 flex-shrink-0" />
                <span className="text-text-primary text-sm">
                  Get a visual overview of your entire operation with real-time
                  dashboards
                </span>
              </li>
              <li className="flex">
                <CheckCircle2 className="text-accent mr-2 h-5 w-5 flex-shrink-0" />
                <span className="text-text-primary text-sm">
                  Track total footage installed, job performance, and business
                  growth
                </span>
              </li>
            </ul>
          </div>
          {/* Messaging & Notifications */}
          <div>
            <h3 className="text-text-primary mb-4 font-semibold">
              Messaging & Notifications
            </h3>
            <ul className="space-y-2">
              <li className="flex">
                <CheckCircle2 className="text-accent mr-2 h-5 w-5 flex-shrink-0" />
                <span className="text-text-primary text-sm">
                  Built-in messaging system for internal communication
                </span>
              </li>
              <li className="flex">
                <CheckCircle2 className="text-accent mr-2 h-5 w-5 flex-shrink-0" />
                <span className="text-text-primary text-sm">
                  Create group chats or private messages with your crew
                </span>
              </li>
              <li className="flex">
                <CheckCircle2 className="text-accent mr-2 h-5 w-5 flex-shrink-0" />
                <span className="text-text-primary text-sm">
                  Full notification system with flexible scheduling for
                  reminders and alerts
                </span>
              </li>
            </ul>
          </div>
          {/* Farmer Portal */}
          <div>
            <h3 className="text-text-primary mb-4 font-semibold">
              Farmer Portal
            </h3>
            <ul className="space-y-2">
              <li className="flex">
                <CheckCircle2 className="text-accent mr-2 h-5 w-5 flex-shrink-0" />
                <span className="text-text-primary text-sm">
                  (Coming Soon – Free This Year!) Farmers can submit jobs with
                  field parameters directly to you
                </span>
              </li>
              <li className="flex">
                <CheckCircle2 className="text-accent mr-2 h-5 w-5 flex-shrink-0" />
                <span className="text-text-primary text-sm">
                  (Coming Soon – Free This Year!) Keep farmers updated in
                  real-time—no more back-and-forth phone calls
                </span>
              </li>
            </ul>
          </div>
        </div>
        {/* Right Column */}
        <div className="space-y-8">
          {/* Billing & Financial Tools */}
          <div>
            <h3 className="text-text-primary mb-4 font-semibold">
              Billing & Financial Tools
            </h3>
            <ul className="space-y-2">
              <li className="flex">
                <CheckCircle2 className="text-accent mr-2 h-5 w-5 flex-shrink-0" />
                <span className="text-text-primary text-sm">
                  Easily generate invoices and prepare billing for each job
                </span>
              </li>
              <li className="flex">
                <CheckCircle2 className="text-accent mr-2 h-5 w-5 flex-shrink-0" />
                <span className="text-text-primary text-sm">
                  Track and manage all expenses and income across projects
                </span>
              </li>
            </ul>
          </div>
          {/* Equipment & Maintenance */}
          <div>
            <h3 className="text-text-primary mb-4 font-semibold">
              Equipment & Maintenance
            </h3>
            <ul className="space-y-2">
              <li className="flex">
                <CheckCircle2 className="text-accent mr-2 h-5 w-5 flex-shrink-0" />
                <span className="text-text-primary text-sm">
                  Add and manage your equipment inventory
                </span>
              </li>
              <li className="flex">
                <CheckCircle2 className="text-accent mr-2 h-5 w-5 flex-shrink-0" />
                <span className="text-text-primary text-sm">
                  Track equipment usage per job and set automated maintenance
                  reminders
                </span>
              </li>
            </ul>
          </div>
          {/* Team & Roles */}
          <div>
            <h3 className="text-text-primary mb-4 font-semibold">
              Team & Roles
            </h3>
            <ul className="space-y-2">
              <li className="flex">
                <CheckCircle2 className="text-accent mr-2 h-5 w-5 flex-shrink-0" />
                <span className="text-text-primary text-sm">
                  Add your entire team with a role-based permission system
                </span>
              </li>
              <li className="flex">
                <CheckCircle2 className="text-accent mr-2 h-5 w-5 flex-shrink-0" />
                <span className="text-text-primary text-sm">
                  Each team member only accesses what&apos;s relevant to their
                  role
                </span>
              </li>
            </ul>
          </div>
          {/* Design Collaboration */}
          <div>
            <h3 className="text-text-primary mb-4 font-semibold">
              Design Collaboration
            </h3>
            <ul className="space-y-2">
              <li className="flex">
                <CheckCircle2 className="text-accent mr-2 h-5 w-5 flex-shrink-0" />
                <span className="text-text-primary text-sm">
                  (Coming Soon – Free This Year!) Share your tiling jobs with
                  the leading tile design company
                </span>
              </li>
              <li className="flex">
                <CheckCircle2 className="text-accent mr-2 h-5 w-5 flex-shrink-0" />
                <span className="text-text-primary text-sm">
                  (Coming Soon – Free This Year!) Track design progress, request
                  changes, and stay in sync with your designers
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </Card>
  );
}
