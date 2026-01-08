import React from 'react';
import { MessageSquare, Book, Code, Lock, Calendar, Users, Settings, FileText, Clock } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { MethodBadge } from '../components/ui/MethodBadge';
import { Tabs } from '../components/ui/Tabs';
import { endpoints, additionalEndpoints, templateEndpoints, availabilityEndpoints, teamsMeetingEndpoints, schedulingThresholdEndpoints } from '../data/api-endpoints';

export function HelpAndFAQ() {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="h-10 w-10 rounded-full bg-rose-100 flex items-center justify-center">
          <MessageSquare className="h-6 w-6 text-rose-600" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Help & FAQ</h1>
          <p className="text-sm text-gray-500">Find answers, get support, and explore documentation</p>
        </div>
      </div>

      <div className="bg-white shadow-lg rounded-lg">
        <Tabs
          tabs={[
            {
              id: 'faq',
              label: 'FAQ',
              icon: MessageSquare,
              content: (
                <div className="p-6 space-y-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Frequently Asked Questions</h2>
                  
                  <div className="space-y-4">
                    <details className="group rounded-lg bg-gray-50 p-4">
                      <summary className="flex cursor-pointer items-center justify-between font-medium">
                        <span>How do I request time off?</span>
                        <span className="transition group-open:rotate-180">
                          <svg fill="none" height="24" width="24"><path d="m17 10-5 5-5-5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"/></svg>
                        </span>
                      </summary>
                      <p className="mt-4 text-gray-600">
                        Click the "Request Time Off" button in the Shift Schedule page. Fill in the required dates and times, then submit your request. Your manager will be notified and can approve or reject the request.
                      </p>
                    </details>

                    <details className="group rounded-lg bg-gray-50 p-4">
                      <summary className="flex cursor-pointer items-center justify-between font-medium">
                        <span>How do I create an acceleration request?</span>
                        <span className="transition group-open:rotate-180">
                          <svg fill="none" height="24" width="24"><path d="m17 10-5 5-5-5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"/></svg>
                        </span>
                      </summary>
                      <p className="mt-4 text-gray-600">
                        When creating an appointment, enable "Acceleration Mode" to book slots that are fully booked or outside normal hours. Fill in the required information and submit for approval.
                      </p>
                    </details>

                    <details className="group rounded-lg bg-gray-50 p-4">
                      <summary className="flex cursor-pointer items-center justify-between font-medium">
                        <span>How do I manage team availability?</span>
                        <span className="transition group-open:rotate-180">
                          <svg fill="none" height="24" width="24"><path d="m17 10-5 5-5-5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"/></svg>
                        </span>
                      </summary>
                      <p className="mt-4 text-gray-600">
                        Administrators can manage team availability through the Modify Availability page. Set standard schedules, create capacity overrides, and manage blocked dates for each team.
                      </p>
                    </details>

                    <details className="group rounded-lg bg-gray-50 p-4">
                      <summary className="flex cursor-pointer items-center justify-between font-medium">
                        <span>How do templates work?</span>
                        <span className="transition group-open:rotate-180">
                          <svg fill="none" height="24" width="24"><path d="m17 10-5 5-5-5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"/></svg>
                        </span>
                      </summary>
                      <p className="mt-4 text-gray-600">
                        Templates use variables like {'{CustomerName}'} that are automatically replaced with actual values. You can create and manage templates for emails and SOW documents in the Modify Templates page.
                      </p>
                    </details>
                  </div>
                </div>
              )
            },
            {
              id: 'help',
              label: 'Help',
              icon: Book,
              content: (
                <div className="p-6 space-y-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Help Center</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <Calendar className="w-6 h-6 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">Scheduling Guide</h3>
                            <p className="text-sm text-gray-500">Learn how to manage appointments</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-purple-100 rounded-lg">
                            <Settings className="w-6 h-6 text-purple-600" />
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">Admin Guide</h3>
                            <p className="text-sm text-gray-500">System configuration help</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="pt-6">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-green-100 rounded-lg">
                            <Users className="w-6 h-6 text-green-600" />
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">Team Management</h3>
                            <p className="text-sm text-gray-500">Managing teams and access</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="mt-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Need More Help?</h3>
                    <div className="bg-gray-50 p-6 rounded-lg">
                      <p className="text-gray-600 mb-4">
                        If you can't find what you're looking for, please submit feedback using the form below. Our team will review your request and get back to you as soon as possible.
                      </p>
                      <form className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                          <input
                            type="text"
                            className="w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="What do you need help with?"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                          <textarea
                            rows={4}
                            className="w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Please describe your issue or question in detail..."
                          />
                        </div>
                        <button
                          type="submit"
                          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        >
                          Submit Feedback
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              )
            },
            {
              id: 'documentation',
              label: 'Documentation',
              icon: FileText,
              content: (
                <div className="p-6 space-y-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">API Documentation</h2>
                  <p className="text-gray-600 mb-6">
                    Welcome to the Calendar Tool API documentation. This documentation provides information about the available endpoints and how to use them.
                  </p>

                  <div className="flex justify-center gap-6 mb-8">
                    <Card className="w-full max-w-sm">
                      <CardContent className="pt-6">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <Code className="w-6 h-6 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">REST API</h3>
                            <p className="text-sm text-gray-500">JSON-based REST API</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="w-full max-w-sm">
                      <CardContent className="pt-6">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-purple-100 rounded-lg">
                            <Lock className="w-6 h-6 text-purple-600" />
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">Authentication</h3>
                            <p className="text-sm text-gray-500">JWT-based auth</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="w-full max-w-sm">
                      <CardContent className="pt-6">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-orange-100 rounded-lg">
                            <Book className="w-6 h-6 text-orange-600" />
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">Documentation</h3>
                            <p className="text-sm text-gray-500">Detailed guides</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Feature Documentation */}
                  <div className="mb-8">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Feature Documentation</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Modify Availability Documentation */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center">
                            <Calendar className="w-5 h-5 mr-2 text-blue-600" />
                            Modify Availability
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <p className="text-gray-600">
                              The Modify Availability page allows administrators to manage team and engineer schedules, capacity overrides, and blocked dates.
                            </p>
                            
                            <h3 className="font-medium text-gray-900">Key Features</h3>
                            <ul className="list-disc pl-5 space-y-1 text-gray-600">
                              <li>Team-based scheduling with engineer assignments</li>
                              <li>Weekly schedule management with day-by-day configuration</li>
                              <li>Engineer-specific time slots with visual indicators</li>
                              <li>Capacity management for concurrent appointments</li>
                              <li>Date-specific capacity overrides</li>
                              <li>Blocked date management</li>
                            </ul>
                          </div>
                        </CardContent>
                      </Card>
                      
                      {/* Workflows Documentation */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center">
                            <Settings className="w-5 h-5 mr-2 text-purple-600" />
                            Modify Workflows
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <p className="text-gray-600">
                              The Modify Workflows page allows administrators to configure product types and their associated change types.
                            </p>
                            
                            <h3 className="font-medium text-gray-900">Key Features</h3>
                            <ul className="list-disc pl-5 space-y-1 text-gray-600">
                              <li>Team-based product type management</li>
                              <li>Change type configuration with duration settings</li>
                              <li>Exclusive change type support</li>
                              <li>Minimum notice period configuration</li>
                            </ul>
                          </div>
                        </CardContent>
                      </Card>
                      
                      {/* Templates Documentation */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center">
                            <FileText className="w-5 h-5 mr-2 text-green-600" />
                            Modify Templates
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <p className="text-gray-600">
                              The Modify Templates page allows administrators to create and manage email and SOW templates with variable substitution.
                            </p>
                            
                            <h3 className="font-medium text-gray-900">Available Variables</h3>
                            <ul className="list-disc pl-5 space-y-1 text-gray-600">
                              <li><code>{'{CustomerName}'}</code> - Customer name</li>
                              <li><code>{'{SOID}'}</code> - Service Order ID</li>
                              <li><code>{'{SRID}'}</code> - Service Request ID</li>
                              <li><code>{'{CustomerAddress}'}</code> - Customer address</li>
                              <li><code>{'{EventDate}'}</code> - Appointment date</li>
                              <li><code>{'{EventStartTime}'}</code> - Appointment start time</li>
                              <li><code>{'{EventEndTime}'}</code> - Appointment end time</li>
                              <li><code>{'{ProductType}'}</code> - Product type name</li>
                              <li><code>{'{ChangeTypes}'}</code> - List of change types</li>
                              <li><code>{'{Notes}'}</code> - Additional notes</li>
                              <li><code>{'{Bridge}'}</code> - Conference bridge details</li>
                            </ul>
                          </div>
                        </CardContent>
                      </Card>
                      
                      {/* Accelerations Documentation */}
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center">
                            <Clock className="w-5 h-5 mr-2 text-red-600" />
                            Accelerations
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <p className="text-gray-600">
                              The Accelerations feature allows booking appointments in time slots that are fully booked or outside normal availability.
                            </p>
                            
                            <h3 className="font-medium text-gray-900">Key Features</h3>
                            <ul className="list-disc pl-5 space-y-1 text-gray-600">
                              <li>Acceleration mode toggle in appointment creation</li>
                              <li>Approval workflow for acceleration requests</li>
                              <li>Customizable acceleration fields</li>
                              <li>Priority levels for accelerations</li>
                            </ul>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>

                  {/* API Authentication */}
                  <div className="space-y-8">
                    <h2 className="text-xl font-semibold text-gray-900">Authentication</h2>
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <p className="text-sm text-gray-600 mb-4">
                        All API requests must include a valid JWT token in the Authorization header:
                      </p>
                      <pre className="bg-gray-900 text-gray-100 p-4 rounded-md overflow-x-auto">
                        <code>Authorization: Bearer {'<your-jwt-token>'}</code>
                      </pre>
                    </div>

                    <h2 className="text-xl font-semibold text-gray-900 mt-8">Endpoints</h2>
                    <div className="space-y-6">
                      {[...endpoints, ...additionalEndpoints, ...templateEndpoints, ...availabilityEndpoints, ...teamsMeetingEndpoints, ...schedulingThresholdEndpoints].map((endpoint, index) => (
                        <div key={index} className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-3">
                              <MethodBadge method={endpoint.method} />
                              <code className="text-sm bg-gray-200 px-2 py-1 rounded">
                                {endpoint.path}
                              </code>
                            </div>
                            {endpoint.authentication && (
                              <div className="flex items-center text-sm text-gray-500">
                                <Lock className="w-4 h-4 mr-1" />
                                Requires Authentication
                              </div>
                            )}
                          </div>

                          <p className="text-gray-600 mb-4">{endpoint.description}</p>

                          {endpoint.parameters && (
                            <div className="mb-4">
                              <h4 className="text-sm font-medium text-gray-900 mb-2">Parameters</h4>
                              <div className="bg-white rounded-md border border-gray-200">
                                <table className="min-w-full divide-y divide-gray-200">
                                  <thead className="bg-gray-50">
                                    <tr>
                                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Required</th>
                                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-gray-200">
                                    {endpoint.parameters.map((param, paramIndex) => (
                                      <tr key={paramIndex}>
                                        <td className="px-4 py-2 text-sm font-medium text-gray-900">{param.name}</td>
                                        <td className="px-4 py-2 text-sm text-gray-500">{param.type}</td>
                                        <td className="px-4 py-2 text-sm text-gray-500">
                                          {param.required ? (
                                            <span className="text-red-600">Yes</span>
                                          ) : (
                                            <span className="text-gray-500">No</span>
                                          )}
                                        </td>
                                        <td className="px-4 py-2 text-sm text-gray-500">{param.description}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          )}

                          {endpoint.response && (
                            <div>
                              <h4 className="text-sm font-medium text-gray-900 mb-2">Response</h4>
                              <div className="bg-gray-900 text-gray-100 p-4 rounded-md overflow-x-auto">
                                <pre className="text-sm">
                                  <code>{endpoint.response.example}</code>
                                </pre>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )
            }
          ]}
        />
      </div>
    </div>
  );
}