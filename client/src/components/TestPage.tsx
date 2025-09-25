import React from "react";
import Button from "./ui/Button";
import Input from "./ui/Input";

const TestPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">UI Test Page</h1>

        <div className="space-y-4">
          <Input
            label="Test Input"
            placeholder="Type something..."
            className="w-full"
          />

          <Button className="w-full">Test Button</Button>

          <Button variant="secondary" className="w-full">
            Secondary Button
          </Button>

          <Button variant="outline" className="w-full">
            Outline Button
          </Button>

          <div className="p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-900">Test Section</h3>
            <p className="text-blue-700 text-sm mt-1">
              This is a test section to verify styling is working correctly.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestPage;
