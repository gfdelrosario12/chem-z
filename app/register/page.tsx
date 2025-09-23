"use client";
import React, { useState, ChangeEvent } from "react";
import {
  AlertCircle,
  CheckCircle2,
  User,
  Mail,
  Lock,
  UserCheck,
  Building2,
  GraduationCap,
  BookOpen,
} from "lucide-react";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

interface FormData {
  password: string;
  confirmPassword: string;
  email: string;
  role: string;
  firstName: string;
  middleName: string;
  lastName: string;
  // Role-specific fields
  department?: string; // For Admin
  gradeLevel?: string; // For Student
  subject?: string; // For Teacher
}

type FormErrors = Partial<Record<keyof FormData, string>>;

interface Role {
  value: string;
  label: string;
  description: string;
}

const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    password: "",
    confirmPassword: "",
    email: "",
    role: "",
    firstName: "",
    middleName: "",
    lastName: "",
    department: "",
    gradeLevel: "",
    subject: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [generalError, setGeneralError] = useState("");

  const roles: Role[] = [
    {
      value: "STUDENT",
      label: "Student",
      description: "Access courses and assignments",
    },
    {
      value: "TEACHER",
      label: "Teacher",
      description: "Create and manage courses",
    },
    {
      value: "ADMIN",
      label: "Administrator",
      description: "Full system access",
    },
  ];

  const gradeLevels = [
    "Grade 7",
    "Grade 8",
    "Grade 9",
    "Grade 10",
    "Grade 11",
    "Grade 12",
  ];

  const subjects = [
    "General Chemistry",
    "Organic Chemistry",
    "Inorganic Chemistry",
    "Physical Chemistry",
    "Analytical Chemistry",
    "Biochemistry",
  ];

  const departments = [
    "Chemistry Department",
    "Science Department",
    "Academic Affairs",
    "Student Affairs",
    "IT Department",
    "Administration",
  ];

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear role-specific fields when role changes
    if (name === "role") {
      setFormData((prev) => ({
        ...prev,
        role: value,
        department: "",
        gradeLevel: "",
        subject: "",
      }));
    }

    // Clear error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }

    // Clear general error
    if (generalError) {
      setGeneralError("");
    }
  };

  const validateForm = (): FormErrors => {
    const newErrors: FormErrors = {};

    // Required field validation
    if (!formData.password) newErrors.password = "Password is required";
    if (!formData.confirmPassword)
      newErrors.confirmPassword = "Please confirm your password";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    if (!formData.role) newErrors.role = "Please select a role";
    if (!formData.firstName.trim())
      newErrors.firstName = "First name is required";
    if (!formData.lastName.trim())
      newErrors.lastName = "Last name is required";

    // Role-specific field validation
    if (formData.role === "ADMIN" && !formData.department?.trim()) {
      newErrors.department = "Department is required for administrators";
    }
    if (formData.role === "STUDENT" && !formData.gradeLevel?.trim()) {
      newErrors.gradeLevel = "Grade level is required for students";
    }
    if (formData.role === "TEACHER" && !formData.subject?.trim()) {
      newErrors.subject = "Subject is required for teachers";
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Password validation
    if (formData.password && formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters long";
    }

    // Confirm password validation
    if (
      formData.password &&
      formData.confirmPassword &&
      formData.password !== formData.confirmPassword
    ) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    return newErrors;
  };

  const handleSubmit = async () => {
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);
    setErrors({});
    setGeneralError("");
    setSuccessMessage("");

    try {
      // Prepare data for API (exclude confirmPassword and unused role-specific fields)
      const { confirmPassword, ...baseData } = formData;

      // Only include role-specific fields based on selected role
      let apiData = { ...baseData };
      if (formData.role === "ADMIN") {
        apiData = {
          password: baseData.password,
          email: baseData.email,
          role: baseData.role,
          firstName: baseData.firstName,
          middleName: baseData.middleName,
          lastName: baseData.lastName,
          department: baseData.department
        };
      } else if (formData.role === "STUDENT") {
        apiData = {
          password: baseData.password,
          email: baseData.email,
          role: baseData.role,
          firstName: baseData.firstName,
          middleName: baseData.middleName,
          lastName: baseData.lastName,
          gradeLevel: baseData.gradeLevel
        };
      } else if (formData.role === "TEACHER") {
        apiData = {
          password: baseData.password,
          email: baseData.email,
          role: baseData.role,
          firstName: baseData.firstName,
          middleName: baseData.middleName,
          lastName: baseData.lastName,
          subject: baseData.subject
        };
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/users/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(apiData),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        if (response.status === 400 && result.message) {
          // Handle specific validation errors from backend
          if (result.message.includes("email")) {
            setErrors({ email: "Email already exists" });
          } else {
            setGeneralError(result.message);
          }
        } else {
          setGeneralError(
            result.message || "Registration failed. Please try again."
          );
        }
        return;
      }

      // Success
      setSuccessMessage("Account created successfully! You can now sign in.");
      setFormData({
        password: "",
        confirmPassword: "",
        email: "",
        role: "",
        firstName: "",
        middleName: "",
        lastName: "",
        department: "",
        gradeLevel: "",
        subject: "",
      });
    } catch (error) {
      console.error("Registration error:", error);
      setGeneralError(
        "Network error. Please check your connection and try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const renderRoleSpecificFields = () => {
    switch (formData.role) {
      case "ADMIN":
        return (
          <div className="space-y-1">
            <label htmlFor="department" className="text-sm font-medium text-gray-700 dark:text-gray-200">
              Department
            </label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <select
                id="department"
                name="department"
                value={formData.department || ""}
                onChange={handleChange}
                className={`w-full pl-10 pr-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600 ${errors.department
                    ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                    : "border-gray-300"
                  }`}
              >
                <option value="">Select department</option>
                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>
            {errors.department && (
              <p className="text-sm text-red-600 dark:text-red-400">{errors.department}</p>
            )}
          </div>
        );

      case "STUDENT":
        return (
          <div className="space-y-1">
            <label htmlFor="gradeLevel" className="text-sm font-medium text-gray-700 dark:text-gray-200">
              Grade Level
            </label>
            <div className="relative">
              <GraduationCap className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <select
                id="gradeLevel"
                name="gradeLevel"
                value={formData.gradeLevel || ""}
                onChange={handleChange}
                className={`w-full pl-10 pr-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600 ${errors.gradeLevel
                    ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                    : "border-gray-300"
                  }`}
              >
                <option value="">Select grade level</option>
                {gradeLevels.map((grade) => (
                  <option key={grade} value={grade}>
                    {grade}
                  </option>
                ))}
              </select>
            </div>
            {errors.gradeLevel && (
              <p className="text-sm text-red-600 dark:text-red-400">{errors.gradeLevel}</p>
            )}
          </div>
        );

      case "TEACHER":
        return (
          <div className="space-y-1">
            <label htmlFor="subject" className="text-sm font-medium text-gray-700 dark:text-gray-200">
              Subject Specialization
            </label>
            <div className="relative">
              <BookOpen className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <select
                id="subject"
                name="subject"
                value={formData.subject || ""}
                onChange={handleChange}
                className={`w-full pl-10 pr-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600 ${errors.subject
                    ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                    : "border-gray-300"
                  }`}
              >
                <option value="">Select subject</option>
                {subjects.map((subj) => (
                  <option key={subj} value={subj}>
                    {subj}
                  </option>
                ))}
              </select>
            </div>
            {errors.subject && (
              <p className="text-sm text-red-600 dark:text-red-400">{errors.subject}</p>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center space-y-2 mb-6">
          <div className="flex items-center justify-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">Cz</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Chem-Z
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Chemistry Learning Management System
          </p>
        </div>

        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-semibold">Create Account</CardTitle>
            <CardDescription>Choose your role and fill in your details</CardDescription>
          </CardHeader>
          <CardContent>

            <div className="p-6 pt-6">
              <div className="space-y-4">
                {/* General Error Message */}
                {generalError && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-3">
                    <div className="flex">
                      <AlertCircle className="h-5 w-5 text-red-400" />
                      <p className="ml-3 text-sm text-red-800 dark:text-red-200">
                        {generalError}
                      </p>
                    </div>
                  </div>
                )}

                {/* Success Message */}
                {successMessage && (
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md p-3">
                    <div className="flex">
                      <CheckCircle2 className="h-5 w-5 text-green-400" />
                      <p className="ml-3 text-sm text-green-800 dark:text-green-200">
                        {successMessage}
                      </p>
                    </div>
                  </div>
                )}

                {/* Role Selection */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
                    Select your role
                  </label>
                  <div className="space-y-2">
                    {roles.map((role) => (
                      <label
                        key={role.value}
                        className={`relative flex cursor-pointer rounded-lg border p-3 focus:outline-none transition-colors ${formData.role === role.value
                            ? "border-blue-600 bg-blue-50 dark:border-blue-500 dark:bg-blue-900/20"
                            : "border-gray-200 bg-white hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700"
                          }`}
                      >
                        <input
                          type="radio"
                          name="role"
                          value={role.value}
                          checked={formData.role === role.value}
                          onChange={handleChange}
                          className="sr-only"
                        />
                        <div className="flex w-full items-center justify-between">
                          <div className="text-sm">
                            <div className="font-medium text-gray-900 dark:text-gray-100">
                              {role.label}
                            </div>
                            <div className="text-gray-600 dark:text-gray-400">
                              {role.description}
                            </div>
                          </div>
                          {formData.role === role.value && (
                            <CheckCircle2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                          )}
                        </div>
                      </label>
                    ))}
                  </div>
                  {errors.role && (
                    <p className="text-sm text-red-600 dark:text-red-400">
                      {errors.role}
                    </p>
                  )}
                </div>

                {/* Role-Specific Fields */}
                {formData.role && renderRoleSpecificFields()}

                {/* Personal Information */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label
                      htmlFor="firstName"
                      className="text-sm font-medium text-gray-700 dark:text-gray-200"
                    >
                      First Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        className={`w-full pl-10 pr-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600 ${errors.firstName
                            ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                            : "border-gray-300"
                          }`}
                        placeholder="John"
                      />
                    </div>
                    {errors.firstName && (
                      <p className="text-sm text-red-600 dark:text-red-400">
                        {errors.firstName}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label
                      htmlFor="lastName"
                      className="text-sm font-medium text-gray-700 dark:text-gray-200"
                    >
                      Last Name
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600 ${errors.lastName
                          ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                          : "border-gray-300"
                        }`}
                      placeholder="Doe"
                    />
                    {errors.lastName && (
                      <p className="text-sm text-red-600 dark:text-red-400">
                        {errors.lastName}
                      </p>
                    )}
                  </div>
                </div>

                {/* Middle Name */}
                <div className="space-y-1">
                  <label
                    htmlFor="middleName"
                    className="text-sm font-medium text-gray-700 dark:text-gray-200"
                  >
                    Middle Name <span className="text-gray-500">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    id="middleName"
                    name="middleName"
                    value={formData.middleName}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600"
                    placeholder="Middle name"
                  />
                </div>

                {/* Email */}
                <div className="space-y-1">
                  <label
                    htmlFor="email"
                    className="text-sm font-medium text-gray-700 dark:text-gray-200"
                  >
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600 ${errors.email
                          ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                          : "border-gray-300"
                        }`}
                      placeholder="john@example.com"
                    />
                  </div>
                  {errors.email && (
                    <p className="text-sm text-red-600 dark:text-red-400">
                      {errors.email}
                    </p>
                  )}
                </div>

                {/* Password Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label
                      htmlFor="password"
                      className="text-sm font-medium text-gray-700 dark:text-gray-200"
                    >
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="password"
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        className={`w-full pl-10 pr-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600 ${errors.password
                            ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                            : "border-gray-300"
                          }`}
                        placeholder="••••••••"
                      />
                    </div>
                    {errors.password && (
                      <p className="text-sm text-red-600 dark:text-red-400">
                        {errors.password}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label
                      htmlFor="confirmPassword"
                      className="text-sm font-medium text-gray-700 dark:text-gray-200"
                    >
                      Confirm Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="password"
                        id="confirmPassword"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className={`w-full pl-10 pr-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600 ${errors.confirmPassword
                            ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                            : "border-gray-300"
                          }`}
                        placeholder="••••••••"
                      />
                    </div>
                    {errors.confirmPassword && (
                      <p className="text-sm text-red-600 dark:text-red-400">
                        {errors.confirmPassword}
                      </p>
                    )}
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 px-4 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Creating Account...
                    </div>
                  ) : (
                    "Create Account"
                  )}
                </button>

                {/* Sign in link */}
                <div className="text-center text-sm">
                  Already have an account?{" "}
                  <a
                    href="/login"
                    className="text-blue-600 hover:underline dark:text-blue-400"
                  >
                    Sign in
                  </a>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RegisterPage;